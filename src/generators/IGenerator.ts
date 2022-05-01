import { Limits } from "../utils/limits";

export interface IGenerator {
  index: number;
  limits: Limits;
  dimension: number;

  batchSize: number;
  values: any[];

  next(): any;
  generate(count: number): any[];
}