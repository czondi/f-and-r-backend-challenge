import { Schema, model } from 'mongoose';
import { IProduct } from '../types';
import { ProducerSchema } from './producer';

export const ProductSchema = new Schema({
  vintage: { type: String, required: true },
  name: { type: String, required: true },
  producerId: { type: Schema.Types.ObjectId, required: true, ref: 'Producer' },
  producer: { type: ProducerSchema, required: true },
});

export const ProductModel = model<IProduct>('Product', ProductSchema);
