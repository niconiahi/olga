import fs from 'fs';
import path from 'path';
import { Plugin, ViteDevServer } from 'vite';
import { glob } from 'glob';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import ts from 'typescript';

export function ui(): Plugin {
  return {
    name: 'vite-plugin-ui-components',
    configureServer(server) {
      server.middlewares.use('/ui', async (_, res) => {
        const files = getFiles('app');
        const root = await createRoot(files, server);
        console.log('root', root)
        // fs.writeFileSync(path.resolve(__dirname, 'root.ts'), root);

        const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI Components</title>
  </head>
  <body>
    <div id="root">${renderToString(root)}</div>
    <script type="module" src="/ui/client.js"></script>
  </body>
  </html>
`;
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      });
    }
  };
}


function getFiles(directory: string): string[] {
  const _files = glob.sync(path.resolve(directory, '**/*.tsx'));

  let files: string[] = [];
  _files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('// @component')) {
      files.push(file);
    }
  });

  return files;
}

export type Prop = { name: string, type: Type }
function getProps(filePath: string, componentName: string): Prop[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  let props: Prop[] = [];
  sourceFile.forEachChild((node) => {
    // normal function declaration
    if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      node.name.text === componentName &&
      node.parameters.length > 0
    ) {
      getPropsFromParams(node.parameters, props);
    }

    // arrow function declaration
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach(declaration => {
        if (
          ts.isVariableDeclaration(declaration) &&
          declaration.name.getText() === componentName &&
          declaration.initializer &&
          ts.isArrowFunction(declaration.initializer)
        ) {
          getPropsFromParams(declaration.initializer.parameters, props);
        }
      });
    }
  });

  return props;
}

function getPropsFromParams(
  parameters: readonly ts.ParameterDeclaration[],
  props: Prop[]
) {
  const param = parameters[0];
  if (param && param.type) {
    const type = param.type;
    if (ts.isTypeLiteralNode(type)) {
      type.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.name && member.type) {
          const name = member.name.getText();
          const type = member.type.getText();
          props.push({ name, type: getType(type) });
        }
      });
    }
  }
}

async function getElement(server: ViteDevServer, file: string, name: string) {
  const componentName = name;
  const module_ = await server.ssrLoadModule(file);
  const element = Object.entries(module_).filter(([name]) => name === componentName)
  return element[0]
}

type Type = { type: 'string', value: string } | { type: 'union', value: string[] } | { type: 'number', value: number }
function getType(raw: string): Type {
  if (raw === 'number') {
    return { type: 'number', value: Number(raw) }
  }

  if (raw.includes('|')) {
    const union = raw
      .replace(/['"]/g, '')
      .trim()
      .split('|')
      .map(item => {
        return item.trim()
      });
    return { type: 'union', value: union }

  }

  return { type: "string", value: raw }
}

export async function createRoot(
  files: string[],
  server: ViteDevServer
) {
  const componentsPromises = files.map(async (file) => {
    const module_ = await server.ssrLoadModule(
      file.replace('/Users/niconiahi/Documents/repos/olga/', '')
    );
    return Object.entries(module_)
      .filter(([name]) => name !== 'default' && name[0] === name[0].toUpperCase())
      .map(([name, element]) => ({
        name,
        element,
        props: getProps(file, name)
      }));
  });
  const components = (await Promise.all(componentsPromises)).flat();
  console.log('------------------------------')
  console.log('components', components)
  console.log('------------------------------')

  const containerPromises = components.map(async ({
    name,
    element,
    props
  }) => {
    const [_, container_] = await getElement(server, 'plugins/ui/container.tsx', 'Container');
    return createElement(
      container_,
      { props, name },
      createElement(element)
    );
  });

  const containers = await Promise.all(containerPromises);
  console.log('containers', containers)
  console.log('------------------------------')


  return createElement(
    'main',
    null,
    ...containers
  )
}
