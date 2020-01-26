import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
      return this.applyWithFunction(sourceFile, walk, this.ruleArguments);
  }
}

interface RuleRecipe {
  regex: string;
  msg: string;
}

interface RegexRule {
  regex: RegExp;
  msg: string;
}

type Options = Array<RuleRecipe>;

// e.g.
// "ban-custom-snippets": [
//   true,
//   {
//     "regex": "^@Input.*Observable",
//     "msg": "Obervable passing as @Input, very bad!"
//   }
// ]

function walk(ctx: Lint.WalkContext<Options>) {
  const regexOptions = [] as RegexRule[];
  ctx.options.forEach(recipe => {
    regexOptions.push({regex: RegExp(recipe.regex), msg: recipe.msg});
  });

  const visitNodeAndChildren = (node: ts.Node) => {
    regexOptions.forEach(rule => {
      if (rule.regex.test(node.getText())) {
        ctx.addFailure(node.getStart(ctx.sourceFile), node.end - 1, rule.msg);
      }
    });
    ts.forEachChild(node, visitNodeAndChildren);
  };
  ts.forEachChild(ctx.sourceFile, visitNodeAndChildren);
}
