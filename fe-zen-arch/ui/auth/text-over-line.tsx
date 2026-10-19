export function TextOverLine({ text }: { text: string }) {
  return (
    <div className="my-6 w-full border-b text-center">
      <span className="foreground inline-block translate-y-1/2 text-sm font-medium text-gray-600">{text}</span>
    </div>
  )
}
