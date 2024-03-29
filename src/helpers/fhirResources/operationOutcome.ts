export class OperationOutcome {
  private _issue: Array<Issue>;
  public get issue(): Array<Issue> {
    return this._issue;
  }
  public set issue(value: Array<Issue>) {
    this._issue = value;
  }
  constructor() {}

  throwOperationOutcome = () => {
    return {
      resourceType: "OperationOutcome",
      issue: this.issue.map((issue) => issue.toJSON()),
    };
  };
}

export class Issue {
  private _sevierity: string;
  public get sevierity(): string {
    return this._sevierity;
  }
  public set sevierity(value: string) {
    this._sevierity = value;
  }
  private _code: string;
  public get code(): string {
    return this._code;
  }
  public set code(value: string) {
    this._code = value;
  }
  private _diagnostics: string;
  public get diagnostics(): string {
    return this._diagnostics;
  }
  public set diagnostics(value: string) {
    this._diagnostics = value;
  }
  private _expression: string[];
  public get expression(): string[] {
    return this._expression;
  }
  public set expression(value: string[]) {
    this._expression = value;
  }
  private _details: {
    text: string;
    coding: {
      system: string;
      code: string;
      version: string;
      display: string;
      userSelected: boolean;
    }[];
  };
  public get details(): {
    text: string;
    coding: {
      system: string;
      code: string;
      version: string;
      display: string;
      userSelected: boolean;
    }[];
  } {
    return this._details;
  }
  public set details(value: {
    text: string;
    coding: {
      system: string;
      code: string;
      version: string;
      display: string;
      userSelected: boolean;
    }[];
  }) {
    this._details = value;
  }

  constructor() {}

  toJSON() {
    return {
      sevierity: this.sevierity,
      code: this.code,
      details: this.details,
      diagnostics: this.diagnostics,
    };
  }
}
