import { Mode } from "../generators/Mode";

export class Result {
  id: number;
  instance?: any;
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

export class Results {
  name: string;
  className?: string;
  namespaces: string[];
  file: string;
  results: Result[];
}