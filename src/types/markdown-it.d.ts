declare module "markdown-it" {
  export interface MarkdownItOptions {
    html?: boolean;
    linkify?: boolean;
    typographer?: boolean;
  }

  export interface MarkdownItInstance {
    render(source: string): string;
  }

  export default function markdownit(
    options?: MarkdownItOptions,
  ): MarkdownItInstance;
}
