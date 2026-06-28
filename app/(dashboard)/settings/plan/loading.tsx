import { Panel } from "@/components/ui/panel"

export default function Loading() {
  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
      <div className="h-8 w-40 animate-pulse rounded-md bg-white/10" />
      <div className="flex max-w-2xl flex-col gap-6">
        <Panel className="p-5">
          <div className="h-24 animate-pulse rounded-md bg-white/5" />
        </Panel>
        <Panel className="p-5">
          <div className="h-32 animate-pulse rounded-md bg-white/5" />
        </Panel>
      </div>
    </div>
  )
}
