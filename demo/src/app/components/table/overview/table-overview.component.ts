import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap/alert';
import { RouterLink } from '@angular/router';
import { NgbdTableOverviewDemo } from './demo/table-overview-demo.component';
import { PageHeaderComponent } from '../../../shared/page-header.component';
// REFACTOR: Removemos o import da classe pai
// import { NgbdOverviewPage } from '../../../shared/overview-page/overview-page.class';
import { COMPONENT_DATA } from '../../../tokens';

@Component({
	selector: 'ngbd-table-overview',
	imports: [NgbAlert, RouterLink, NgbdTableOverviewDemo, PageHeaderComponent],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './table-overview.component.html',
	host: {
		'[class.overview]': 'true',
	},
})
export class NgbdTableOverviewComponent {
	// REFACTOR: Injeção direta (Composição)
	private _component = inject(COMPONENT_DATA);

	get overview() {
		return this._component.overview;
	}

	get menuItems() {
		return Object.entries(this.overview).map(([fragment, title]) => ({ fragment, title }));
	}
}
