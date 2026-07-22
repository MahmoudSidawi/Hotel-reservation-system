import { Schema, models, model, type InferSchemaType } from "mongoose";

const AmenitySchema = new Schema({
  name: { type: String, required: true },
  icon: { type: String },
});

export type Amenity = InferSchemaType<typeof AmenitySchema>;

export default models.Amenity || model("Amenity", AmenitySchema);
