interface ImportMeta {
  readonly env: Record<string, string>
}

declare module 'qrcode' {
  export function toCanvas(
    canvas: any,
    text: string,
    options: Record<string, any>,
    callback: (error: Error | null | undefined) => void
  ): void
}
