// text-link-widget.component.ts
import { Component, OnInit, Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-text-link-widget',
  template: '<div id="hapo-widget-box"></div>'
})
export class TextLinkWidgetComponent implements OnInit {
  constructor(
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    const script = this.renderer.createElement('script');
    script.src = '{{BASE_URL}}/textlink-widget.js';
    script.setAttribute('data-portal-url', '{{PORTAL_URL}}');
    script.setAttribute('data-api-key', '{{API_KEY}}');
    script.setAttribute('data-container', 'hapo-widget-box');
    
    this.renderer.appendChild(this.document.body, script);
  }
}
