import { NextRequest, NextResponse } from "next/server";
import { requireUser, isStaff } from "@/lib/apiAuth";
import { connectToDatabase } from "@/backend/config/db";
import Reservation from "@/backend/models/Reservation";
import { jsonError } from "@/backend/middlewares/errorHandler";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireUser();
    const { id } = await params;

    await connectToDatabase();
    const reservation = await Reservation.findById(id)
      .populate("userId", "name email phone")
      .populate("roomId", "roomNumber floor")
      .populate({
        path: "roomId",
        populate: { path: "roomTypeId", select: "name bedType" },
      })
      .lean();

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    // Guests can only access their own invoice
    if (!isStaff(actor) && String(reservation.userId?._id ?? reservation.userId) !== actor.sub) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const guestName =
      (reservation.userId as unknown as { name?: string })?.name ?? reservation.guestName ?? "Guest";
    const guestEmail =
      (reservation.userId as unknown as { email?: string })?.email ?? reservation.guestEmail ?? "";
    const roomNumber = (reservation.roomId as unknown as { roomNumber?: string })?.roomNumber ?? "—";
    const roomTypeName =
      (reservation.roomId as unknown as { roomTypeId?: { name?: string } })?.roomTypeId?.name ?? "—";

    const nights = Math.max(
      1,
      Math.round(
        (new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / 86400000
      )
    );

    const extraServicesRows = (reservation.extraServices ?? [])
      .map(
        (s: { name: string; price: number; quantity: number }) =>
          `<tr><td style="padding:6px 12px;">${s.name}</td><td style="padding:6px 12px; text-align:right;">${s.quantity}x</td><td style="padding:6px 12px; text-align:right;">$${(s.price * s.quantity).toLocaleString()}</td></tr>`
      )
      .join("");

    const subtotal = (reservation.totalPrice ?? 0) / 1.12;
    const taxes = (reservation.totalPrice ?? 0) - subtotal;

    const invoiceNumber = reservation.invoiceNumber ?? `INV-${String(id).slice(-8).toUpperCase()}`;
    const issueDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoiceNumber} — Velora Hotel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 40px; max-width: 700px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #f0f0f0; }
    .hotel-name { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .hotel-sub { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px; margin-top: 2px; }
    .invoice-title { font-size: 28px; font-weight: 300; color: #C5A46D; }
    .invoice-num { font-size: 12px; color: #888; text-align: right; margin-top: 4px; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; }
    .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin-bottom: 8px; }
    .party-name { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
    .party-detail { font-size: 12px; color: #555; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f8f8f8; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #666; }
    td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
    .total-section { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #555; }
    .total-row.grand { padding: 12px 0; font-size: 16px; font-weight: 800; color: #111; border-top: 2px solid #111; margin-top: 8px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #f0f0f0; text-align: center; font-size: 11px; color: #aaa; line-height: 1.8; }
    .badge { display: inline-block; background: #ecfdf5; color: #059669; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="hotel-name">VELORA</div>
      <div class="hotel-sub">Hotel & Residences</div>
    </div>
    <div style="text-align:right;">
      <div class="invoice-title">Invoice</div>
      <div class="invoice-num">${invoiceNumber}</div>
      <div class="invoice-num" style="margin-top:4px;">Issued: ${issueDate}</div>
    </div>
  </div>

  <div class="parties">
    <div>
      <div class="party-label">Billed To</div>
      <div class="party-name">${guestName}</div>
      <div class="party-detail">${guestEmail}</div>
    </div>
    <div>
      <div class="party-label">Reservation</div>
      <div class="party-detail">
        Check-in: <strong>${new Date(reservation.checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong><br/>
        Check-out: <strong>${new Date(reservation.checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong><br/>
        Duration: <strong>${nights} night${nights !== 1 ? "s" : ""}</strong><br/>
        Status: <span class="badge">${reservation.status.replace(/_/g, " ")}</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:right;">Qty</th>
        <th style="text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <strong>Room #${roomNumber}</strong> — ${roomTypeName}<br/>
          <span style="font-size:11px; color:#888;">${nights} nights accommodation</span>
        </td>
        <td style="text-align:right;">${nights}</td>
        <td style="text-align:right;">$${Math.round(subtotal).toLocaleString()}</td>
      </tr>
      ${extraServicesRows}
    </tbody>
  </table>

  <div class="total-section">
    <div class="total-row"><span>Subtotal</span><span>$${Math.round(subtotal).toLocaleString()}</span></div>
    <div class="total-row"><span>Tax (12%)</span><span>$${Math.round(taxes).toLocaleString()}</span></div>
    <div class="total-row grand"><span>Total Due</span><span>$${(reservation.totalPrice ?? 0).toLocaleString()}</span></div>
  </div>

  <div class="footer">
    Thank you for choosing Velora Hotel & Residences.<br/>
    For inquiries: reservations@velora.com · +1 (800) 555-0199<br/>
    123 Oceanfront Boulevard · Velora Beach · CA 90210
  </div>

  <div class="no-print" style="margin-top:32px; text-align:center;">
    <button onclick="window.print()" style="background:#111; color:#fff; border:none; padding:12px 28px; font-size:14px; font-weight:600; border-radius:8px; cursor:pointer;">
      🖨️ Print / Save as PDF
    </button>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    return jsonError(error);
  }
}
