import { Mode } from "../generators/Mode";

export class Result {
  id: number;
  args: any[];
  result?: any;
  mode: Mode;
  coverageHash: string;
  runCount: number;
  speed: number;
  isCovered: boolean;
  error?: string;

  constructor(init: Partial<Result>) {
    Object.assign(this, init);
  }
}