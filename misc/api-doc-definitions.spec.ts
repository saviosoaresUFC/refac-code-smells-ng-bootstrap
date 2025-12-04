import { parseOutApiDocs as apiDoc } from './api-doc';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('APIDocVisitor - Services, Interfaces & Metadata', () => {

	it('should extract basic type info from classes', () => {
		const docs = apiDoc(['misc/api-doc-test-cases/types.ts']);

		assert.strictEqual(Object.keys(docs).length, 5);

		assert.strictEqual(docs.NgbDirective.type, 'Directive');
		assert.strictEqual(docs.NgbComponent.type, 'Component');
		assert.strictEqual(docs.NgbService.type, 'Service');
		assert.strictEqual(docs.NgbClass.type, 'Class');
		assert.strictEqual(docs.NgbInterface.type, 'Interface');
	});

	it('should extract documentation from services', () => {
		const serviceDocs = apiDoc(['./misc/api-doc-test-cases/services-with-methods.ts']).ModalService;

		assert.strictEqual(serviceDocs.fileName, './misc/api-doc-test-cases/services-with-methods.ts');
		assert.strictEqual(serviceDocs.className, 'ModalService');
		assert.strictEqual(serviceDocs.description, '<p>A service to open modals</p>');
		assert.strictEqual(serviceDocs.methods.length, 2);

		assert.strictEqual(serviceDocs.methods[0].name, 'open');
		assert.strictEqual(serviceDocs.methods[0].description, '<p>A method to open a modal</p>');
		assert.strictEqual(serviceDocs.methods[0].args.length, 2);
		assert.strictEqual(serviceDocs.methods[0].returnType, 'Promise<any>');

		assert.strictEqual(serviceDocs.methods[1].name, 'isOpen');
		assert.strictEqual(serviceDocs.methods[1].description, '<p>Checks if a modal is open</p>');
		assert.strictEqual(serviceDocs.methods[1].args.length, 0);
		assert.strictEqual(serviceDocs.methods[1].returnType, 'boolean');
	});

	it('should extract documentation of properties from services', () => {
		const serviceDocs = apiDoc(['./misc/api-doc-test-cases/services-with-properties.ts']).ProgressbarConfig;

		assert.strictEqual(serviceDocs.properties.length, 3);

		assert.strictEqual(serviceDocs.properties[0].name, 'foo');
		assert.strictEqual(serviceDocs.properties[0].description, '<p>Voluntarily left without a default value.</p>');
		assert.strictEqual(serviceDocs.properties[0].type, 'string');
		assert.strictEqual(serviceDocs.properties[0].defaultValue, undefined);

		assert.strictEqual(serviceDocs.properties[1].name, 'max');
		assert.strictEqual(
			serviceDocs.properties[1].description,
			'<p>Maximal value to be displayed in the progressbar.</p>',
		);
		assert.strictEqual(serviceDocs.properties[1].type, 'number');
		assert.strictEqual(serviceDocs.properties[1].defaultValue, '100');

		assert.strictEqual(serviceDocs.properties[2].name, 'noDescriptionButStillExtract');
		assert.strictEqual(serviceDocs.properties[2].description, '');
		assert.strictEqual(serviceDocs.properties[2].type, 'string');
		assert.strictEqual(serviceDocs.properties[2].defaultValue, `'sth'`);
	});

	it('should extract documentation from interfaces', () => {
		const interfaceDocs = apiDoc(['./misc/api-doc-test-cases/interface-with-properties.ts']).NgbModalOptions;

		assert.strictEqual(interfaceDocs.className, 'NgbModalOptions');
		assert.strictEqual(interfaceDocs.description, '<p>Represent options available when opening new modal windows.</p>');
		assert.strictEqual(interfaceDocs.properties.length, 3);

		assert.strictEqual(interfaceDocs.properties[0].name, 'backdrop');
		assert.ok(
			interfaceDocs.properties[0].description.includes(
				'Weather a backdrop element should be created for a given modal (true by default).',
			),
		);
		assert.strictEqual(interfaceDocs.properties[0].type, `boolean | 'static'`);
		assert.strictEqual(interfaceDocs.properties[0].defaultValue, undefined);

		assert.strictEqual(interfaceDocs.properties[1].name, 'keyboard');
		assert.strictEqual(
			interfaceDocs.properties[1].description,
			'<p>Weather to close the modal when escape key is pressed (true by default).</p>',
		);
		assert.strictEqual(interfaceDocs.properties[1].type, 'boolean');
		assert.strictEqual(interfaceDocs.properties[1].defaultValue, undefined);

		assert.strictEqual(interfaceDocs.properties[2].name, 'size');
		assert.strictEqual(interfaceDocs.properties[2].description, '<p>Size of a new modal window.</p>');
		assert.strictEqual(interfaceDocs.properties[2].type, `'sm' | 'lg' | 'xl' | string`);
		assert.strictEqual(interfaceDocs.properties[2].defaultValue, undefined);
	});

	it('should extract method documentation from interfaces', () => {
		const interfaceDocs = apiDoc(['./misc/api-doc-test-cases/interface-with-methods.ts']).SomeInterface;

		assert.strictEqual(interfaceDocs.className, 'SomeInterface');
		assert.strictEqual(interfaceDocs.description, '<p>Some interface</p>');
		assert.strictEqual(interfaceDocs.methods.length, 1);

		assert.strictEqual(interfaceDocs.methods[0].name, 'foo');
		assert.ok(interfaceDocs.methods[0].description.includes('does something'));
		assert.strictEqual(interfaceDocs.methods[0].returnType, 'void');
	});

	it('should extract documentation from documented classes', () => {
		const classDocs = apiDoc(['./misc/api-doc-test-cases/class-with-doc.ts']).DocumentedFoo;

		assert.strictEqual(classDocs.className, 'DocumentedFoo');
		assert.strictEqual(classDocs.description, '<p>This is a documented foo</p>');

		assert.strictEqual(classDocs.properties.length, 2);

		assert.strictEqual(classDocs.properties[0].name, 'bar');
		assert.strictEqual(classDocs.properties[0].description, '<p>the bar</p>');
		assert.strictEqual(classDocs.properties[0].type, 'string');

		assert.strictEqual(classDocs.properties[1].name, 'componentInstance');
		assert.strictEqual(classDocs.properties[1].description, '<p>A getter</p>');
		assert.strictEqual(classDocs.properties[1].type, 'any');

		assert.strictEqual(classDocs.methods.length, 1);

		assert.strictEqual(classDocs.methods[0].name, 'someMethod');
		assert.strictEqual(classDocs.methods[0].description, '<p>some method</p>');
		assert.strictEqual(classDocs.methods[0].returnType, 'void');
	});

	it('should extract deprecation information', () => {
		const docs = apiDoc(['misc/api-doc-test-cases/release-deprecation.ts']);

		assert.deepStrictEqual(docs.NgbDirective.deprecated, { version: '2.0.0', description: 'description' });
		assert.deepStrictEqual(docs.NgbComponent.deprecated, { version: '2.0.0', description: 'description' });
		assert.deepStrictEqual(docs.NgbService.deprecated, { version: '2.0.0', description: 'description' });
		assert.deepStrictEqual(docs.NgbClass.deprecated, { version: '2.0.0', description: 'description' });
		assert.deepStrictEqual(docs.NgbInterface.deprecated, { version: '2.0.0', description: 'description' });

		assert.deepStrictEqual(docs.NgbDirective.inputs[0].deprecated, { version: '2.0.0', description: 'description' });
		assert.deepStrictEqual(docs.NgbDirective.outputs[0].deprecated, { version: '2.0.0', description: 'description' });
		assert.deepStrictEqual(docs.NgbDirective.properties[0].deprecated, {
			version: '2.0.0',
			description: 'description',
		});
		assert.deepStrictEqual(docs.NgbDirective.methods[0].deprecated, { version: '2.0.0', description: 'description' });
	});

	it('should extract feature introduction information', () => {
		const docs = apiDoc(['misc/api-doc-test-cases/release-features.ts']);

		assert.deepStrictEqual(docs.NgbDirective.since, { version: '2.0.0', description: '' });
		assert.deepStrictEqual(docs.NgbComponent.since, { version: '2.0.0', description: '' });
		assert.deepStrictEqual(docs.NgbService.since, { version: '2.0.0', description: '' });
		assert.deepStrictEqual(docs.NgbClass.since, { version: '2.0.0', description: '' });
		assert.deepStrictEqual(docs.NgbInterface.since, { version: '2.0.0', description: '' });

		assert.deepStrictEqual(docs.NgbDirective.inputs[0].since, { version: '2.0.0', description: '' });
		assert.deepStrictEqual(docs.NgbDirective.outputs[0].since, { version: '2.0.0', description: '' });
		assert.deepStrictEqual(docs.NgbDirective.properties[0].since, { version: '2.0.0', description: '' });
		assert.deepStrictEqual(docs.NgbDirective.methods[0].since, { version: '2.0.0', description: '' });
	});
});