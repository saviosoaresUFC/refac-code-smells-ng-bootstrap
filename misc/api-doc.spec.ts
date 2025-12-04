import { parseOutApiDocs as apiDoc } from './api-doc';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('APIDocVisitor - Components & Directives', () => {
	it('should return [] if there are no docs to extract', () => {
		assert.deepStrictEqual(apiDoc(['./misc/api-doc-test-cases/no-docs.ts']), {});
	});

	it('should extract basic info from directives and components', () => {
		const docs = apiDoc(['misc/api-doc-test-cases/directives-no-in-out.ts']);

		assert.strictEqual(Object.keys(docs).length, 2);

		assert.strictEqual(docs.Foo.fileName, 'misc/api-doc-test-cases/directives-no-in-out.ts');
		assert.strictEqual(docs.Foo.className, 'Foo');
		assert.strictEqual(docs.Foo.selector, `'[foo]'`);
		assert.strictEqual(docs.Foo.description, '<p>Foo doc</p>');
		assert.strictEqual(docs.Foo.exportAs, `'foo'`);

		assert.strictEqual(docs.Bar.fileName, 'misc/api-doc-test-cases/directives-no-in-out.ts');
		assert.strictEqual(docs.Bar.className, 'Bar');
		assert.strictEqual(docs.Bar.selector, `'bar'`);
		assert.strictEqual(docs.Bar.exportAs, undefined);
		assert.strictEqual(docs.Bar.description, '<p>Bar doc</p>');
	});

	it('should extract inputs info', () => {
		const inputDocs = apiDoc(['./misc/api-doc-test-cases/directives-with-inputs.ts']).Foo.inputs;

		assert.strictEqual(inputDocs.length, 6);

		assert.strictEqual(inputDocs[0].name, 'bar');
		assert.strictEqual(inputDocs[0].defaultValue, undefined);
		assert.strictEqual(inputDocs[0].type, 'string');
		assert.strictEqual(inputDocs[0].description, '<p>Bar doc</p>');

		assert.strictEqual(inputDocs[1].name, 'baz');
		assert.strictEqual(inputDocs[1].defaultValue, undefined);
		assert.strictEqual(inputDocs[1].type, 'string | boolean');
		assert.strictEqual(inputDocs[1].description, '');

		assert.strictEqual(inputDocs[2].name, 'foo');
		assert.strictEqual(inputDocs[2].defaultValue, '5');
		assert.strictEqual(inputDocs[2].type, 'number');
		assert.strictEqual(inputDocs[2].description, '<p>Has default value</p>');

		assert.strictEqual(inputDocs[3].name, 'ngbAliased1');
		assert.strictEqual(inputDocs[3].type, 'string');

		assert.strictEqual(inputDocs[4].name, 'ngbAliased2');
		assert.strictEqual(inputDocs[4].type, 'string');

		assert.strictEqual(inputDocs[5].name, 'required');
		assert.strictEqual(inputDocs[5].type, 'string');
	});

	it('should extract input default value', () => {
		const inputDocs = apiDoc(['./misc/api-doc-test-cases/directives-with-inputs-default-vals.ts']).Foo.inputs;

		assert.strictEqual(inputDocs.length, 3);

		assert.strictEqual(inputDocs[0].defaultValue, 'false');
		assert.strictEqual(inputDocs[1].defaultValue, '5');
		assert.strictEqual(inputDocs[2].defaultValue, `'bar'`);
	});

	it('should extract inferred types', () => {
		const inputDocs = apiDoc(['./misc/api-doc-test-cases/directives-with-inputs-types-to-infer.ts']).Foo.inputs;

		assert.strictEqual(inputDocs.length, 3);

		assert.strictEqual(inputDocs[0].defaultValue, 'false');
		assert.strictEqual(inputDocs[0].type, 'boolean');
		assert.strictEqual(inputDocs[1].defaultValue, '5');
		assert.strictEqual(inputDocs[1].type, 'number');
		assert.strictEqual(inputDocs[2].defaultValue, `'bar'`);
		assert.strictEqual(inputDocs[2].type, 'string');
	});

	it('should extract inputs info from setters', () => {
		const inputDocs = apiDoc(['./misc/api-doc-test-cases/directives-with-tricky-inputs.ts']).Foo.inputs;

		assert.strictEqual(inputDocs.length, 3);

		assert.strictEqual(inputDocs[0].name, 'bar');
		assert.strictEqual(inputDocs[1].name, 'baz');
		assert.strictEqual(inputDocs[2].name, 'foo');
	});

	it('should extract outputs info', () => {
		const outDocs = apiDoc(['./misc/api-doc-test-cases/directives-with-outputs.ts']).Foo.outputs;

		assert.strictEqual(outDocs.length, 2);

		assert.strictEqual(outDocs[0].name, 'myEvent');
		assert.strictEqual(outDocs[0].description, '<p>Desc</p>');

		assert.strictEqual(outDocs[1].name, 'myMappedEvent');
	});

	it('should extract public methods info', () => {
		const methodDocs = apiDoc(['./misc/api-doc-test-cases/directives-with-methods.ts']).Foo.methods;

		assert.strictEqual(methodDocs.length, 1);
		assert.strictEqual(methodDocs[0].name, 'fooMethod');
		assert.strictEqual(methodDocs[0].description, '<p>Use this one to produce foo!</p>');
		assert.strictEqual(methodDocs[0].args.length, 3);
		assert.strictEqual(methodDocs[0].args[0].name, 'arg1');
		assert.strictEqual(methodDocs[0].args[0].type, 'string');
		assert.strictEqual(methodDocs[0].args[1].name, 'arg2');
		assert.strictEqual(methodDocs[0].args[1].type, 'any');
		assert.strictEqual(methodDocs[0].args[2].name, 'arg3');
		assert.strictEqual(methodDocs[0].args[2].type, 'number');
	});

	it('should not extract internal components, directives, services and interfaces', () => {
		const docs = apiDoc(['./misc/api-doc-test-cases/internal-things.ts']);

		assert.deepStrictEqual(docs, {});
	});

	it('should not extract public methods info when annotated with @internal', () => {
		const methodDocs = apiDoc(['./misc/api-doc-test-cases/component-with-internal-methods.ts']).Foo.methods;

		assert.strictEqual(methodDocs.length, 0);
	});
});