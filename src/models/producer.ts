import { Schema, model } from 'mongoose';
import { IProducer } from '../types';

export const ProducerSchema = new Schema({
  name: { type: String, required: true },
  country: String,
  region: String,
});

export const ProducerModel = model<IProducer>('Producer', ProducerSchema);
