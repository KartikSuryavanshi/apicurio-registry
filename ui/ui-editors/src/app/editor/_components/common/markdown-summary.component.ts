/**
 * @license
 * Copyright 2018 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component, Input, OnChanges, SimpleChanges, ViewEncapsulation} from "@angular/core";
import * as marked from "marked";

@Component({
    selector: "markdown-summary",
    template: `<span class="md-summary" [innerHTML]="convertedData" [class.empty]="isEmpty()"></span>`,
    encapsulation: ViewEncapsulation.None
})
export class MarkdownSummaryComponent implements OnChanges {
    @Input("data")
    data: string;
    @Input("delimiter")
    delimiter: string = " ";
    @Input("showImageText")
    showImageText: boolean = false;
    @Input("emptyText")
    emptyText: string = "No value.";

    convertedData: string;

    ngOnChanges(changes: SimpleChanges): void {
        if (this.isEmpty()) {
            this.convertedData = this.emptyText;
        } else {
            const ptRenderer: marked.Renderer = new PlainTextRenderer();
            const mrval = marked.parse(this.data, {
                renderer: ptRenderer
            });
            if (typeof mrval === "string") {
                this.convertedData = mrval.trim();
            } else {
                mrval.then(value => {
                    this.convertedData = value.trim();
                });
            }
        }
    }

    public isEmpty(): boolean {
        return this.data === null || this.data === undefined || this.data.trim().length === 0;
    }

}


class PlainTextRenderer extends marked.Renderer {

    delimiter: string = " ";
    showImageText: boolean = false;

    public code(): string {
        return this.delimiter + "<code>...</code>" + this.delimiter;
    }
    public blockquote({ tokens }: marked.Tokens.Blockquote): string {
        return "\t" + this.parser.parse(tokens) + this.delimiter;
    }
    public html({ text }: marked.Tokens.HTML | marked.Tokens.Tag): string {
        return escape(text);
    }
    public heading({ tokens }: marked.Tokens.Heading): string {
        return this.parser.parseInline(tokens);
    }
    public hr(): string {
        return this.delimiter + this.delimiter;
    }
    public list({ items }: marked.Tokens.List): string {
        return items.map((item) => this.listitem(item)).join("");
    }
    public listitem({ tokens }: marked.Tokens.ListItem): string {
        return "\t" + this.parser.parse(tokens) + this.delimiter;
    }
    public paragraph({ tokens }: marked.Tokens.Paragraph): string {
        return this.delimiter + this.parser.parseInline(tokens) + this.delimiter;
    }
    public table({ header, rows }: marked.Tokens.Table): string {
        const headerText = header.map((cell) => this.tablecell(cell)).join("");
        const rowsText = rows.map((row) => row.map((cell) => this.tablecell(cell)).join("")).join("");
        return this.delimiter + headerText + this.delimiter + rowsText + this.delimiter;
    }
    public tablerow({ text }: marked.Tokens.TableRow): string {
        return text + this.delimiter;
    }
    public tablecell({ tokens }: marked.Tokens.TableCell): string {
        return this.parser.parseInline(tokens) + "\t";
    }
    public strong({ tokens }: marked.Tokens.Strong): string {
        return this.parser.parseInline(tokens);
    }
    public em({ tokens }: marked.Tokens.Em): string {
        return this.parser.parseInline(tokens);
    }
    public codespan({ text }: marked.Tokens.Codespan): string {
        return text;
    }
    public br(): string {
        return this.delimiter + this.delimiter;
    }
    public del({ tokens }: marked.Tokens.Del): string {
        return this.parser.parseInline(tokens);
    }
    public link({ tokens }: marked.Tokens.Link): string {
        return this.parser.parseInline(tokens);
    }
    public image({ text }: marked.Tokens.Image): string {
        return this.showImageText ? text : "";
    }
    public text({ text }: marked.Tokens.Text | marked.Tokens.Escape): string {
        return text;
    }
}
