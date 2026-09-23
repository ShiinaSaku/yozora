import Image from "@/components/ui/image"
import Link from "@/components/ui/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserGroupIcon } from "@hugeicons/core-free-icons"
import { getCharacterUrl } from "@/lib/utils/slug"
import type { AnimeCharacter } from "@/lib/types/anime"

interface AnimeDetailCharactersProps {
  characters: AnimeCharacter[]
}

export function AnimeDetailCharacters({
  characters,
}: AnimeDetailCharactersProps) {
  if (characters.length === 0) {
    return null
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <HugeiconsIcon icon={UserGroupIcon} size={18} strokeWidth={2} />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Main Characters ({characters.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {characters.map((char) => (
          <Link
            key={char.id}
            href={getCharacterUrl({ id: char.id, name: { full: char.name } })}
            variant="card-character"
            className="group flex items-center justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image
                  src={char.image || "https://placehold.co/100x100"}
                  alt={char.name}
                  fill
                  unoptimized
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                  {char.name}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {char.role.toLowerCase()}
                </span>
              </div>
            </div>

            {char.voiceActor && (
              <div className="flex shrink-0 items-center gap-2.5 text-right">
                <div className="flex flex-col">
                  <span className="max-w-28 truncate text-xs font-medium text-foreground">
                    {char.voiceActor.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {char.voiceActor.language || "Japanese"}
                  </span>
                </div>
                {char.voiceActor.image && (
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                    <Image
                      src={char.voiceActor.image}
                      alt={char.voiceActor.name}
                      fill
                      unoptimized
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
