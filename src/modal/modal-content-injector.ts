import {
	ApplicationRef,
	createComponent,
	EnvironmentInjector,
	inject,
	Injectable,
	Injector,
	TemplateRef,
	Type,
	DOCUMENT,
} from '@angular/core';
import { isString, ContentRef } from '@ng-bootstrap/ng-bootstrap/utils';
import { NgbActiveModal } from './modal-ref';
import { NgbModalOptions } from './modal-config';

@Injectable({ providedIn: 'root' })
export class NgbModalContentInjector {
	private _applicationRef = inject(ApplicationRef);
	private _environmentInjector = inject(EnvironmentInjector);
	private _document = inject(DOCUMENT);

	getContentRef(
		contentInjector: Injector,
		content: Type<any> | TemplateRef<any> | string,
		activeModal: NgbActiveModal,
		options: NgbModalOptions,
	): ContentRef {
		if (!content) {
			return new ContentRef([]);
		} else if (content instanceof TemplateRef) {
			return this._createFromTemplateRef(content, activeModal);
		} else if (isString(content)) {
			return this._createFromString(content);
		} else {
			return this._createFromComponent(contentInjector, content, activeModal, options);
		}
	}

	private _createFromTemplateRef(templateRef: TemplateRef<any>, activeModal: NgbActiveModal): ContentRef {
		const context = {
			$implicit: activeModal,
			close(result) {
				activeModal.close(result);
			},
			dismiss(reason) {
				activeModal.dismiss(reason);
			},
		};
		const viewRef = templateRef.createEmbeddedView(context);
		this._applicationRef.attachView(viewRef);
		return new ContentRef([viewRef.rootNodes], viewRef);
	}

	private _createFromString(content: string): ContentRef {
		const component = this._document.createTextNode(`${content}`);
		return new ContentRef([[component]]);
	}

	private _createFromComponent(
		contentInjector: Injector,
		componentType: Type<any>,
		context: NgbActiveModal,
		options: NgbModalOptions,
	): ContentRef {
		const elementInjector = Injector.create({
			providers: [{ provide: NgbActiveModal, useValue: context }],
			parent: contentInjector,
		});
		const componentRef = createComponent(componentType, {
			environmentInjector: contentInjector.get(EnvironmentInjector, null) || this._environmentInjector,
			elementInjector,
		});
		const componentNativeEl = componentRef.location.nativeElement;
		if (options.scrollable) {
			(componentNativeEl as HTMLElement).classList.add('component-host-scrollable');
		}
		this._applicationRef.attachView(componentRef.hostView);
		// FIXME: we should here get rid of the component nativeElement
		// and use `[Array.from(componentNativeEl.childNodes)]` instead and remove the above CSS class.
		return new ContentRef([[componentNativeEl]], componentRef.hostView, componentRef);
	}
}