import { Limits } from "../utils/limits";

export interface IGenerator {
  index: number;
  limits: Limits;
  dimension: number;

  batchSize: number;
  values: any[];

  generate(count: number): any[];
  next(): any;
}