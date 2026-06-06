"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Users } from "lucide-react";

export type WorkspacePaletteItem = {
  family: string;
  name: string;
  color: string;
};

export type WorkspaceGown = {
  id: string;
  tag: string;
  name: string;
  price: string;
  fabric: string;
  colorName: string;
  image: string;
};

export type BridalMember = {
  id: string;
  name: string;
  role: string;
  size: string;
  notes: string;
};

type BridalWorkspaceContextValue = {
  workspacePalette: WorkspacePaletteItem[];
  workspaceGowns: WorkspaceGown[];
  bridalMembers: BridalMember[];

  addPalette: (item: WorkspacePaletteItem) => void;
  removePalette: (item: WorkspacePaletteItem) => void;

  addGown: (item: WorkspaceGown) => void;
  removeGown: (id: string) => void;

  addMember: () => void;
  updateMember: (
    id: string,
    field: keyof Omit<BridalMember, "id">,
    value: string
  ) => void;
  removeMember: (id: string) => void;

  clearWorkspace: () => void;
};

const BridalWorkspaceContext =
  createContext<BridalWorkspaceContextValue | null>(null);

const STORAGE_KEY = "shahsi-bridal-workspace";

function createMember(): BridalMember {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    name: "",
    role: "Bridesmaid",
    size: "",
    notes: "",
  };
}

export function BridalWorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspacePalette, setWorkspacePalette] = useState<
    WorkspacePaletteItem[]
  >([]);
  const [workspaceGowns, setWorkspaceGowns] = useState<WorkspaceGown[]>([]);
  const [bridalMembers, setBridalMembers] = useState<BridalMember[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedWorkspace = window.localStorage.getItem(STORAGE_KEY);

      if (savedWorkspace) {
        const parsed = JSON.parse(savedWorkspace) as {
          palette?: WorkspacePaletteItem[];
          gowns?: WorkspaceGown[];
          members?: BridalMember[];
        };

        setWorkspacePalette(Array.isArray(parsed.palette) ? parsed.palette : []);
        setWorkspaceGowns(Array.isArray(parsed.gowns) ? parsed.gowns : []);
        setBridalMembers(Array.isArray(parsed.members) ? parsed.members : []);
      }
    } catch (error) {
      console.error("Failed to load bridal workspace", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        palette: workspacePalette,
        gowns: workspaceGowns,
        members: bridalMembers,
      })
    );
  }, [hydrated, workspacePalette, workspaceGowns, bridalMembers]);

  const value = useMemo<BridalWorkspaceContextValue>(
    () => ({
      workspacePalette,
      workspaceGowns,
      bridalMembers,

      addPalette: (item) => {
        setWorkspacePalette((prev) => {
          const exists = prev.some(
            (color) => color.family === item.family && color.name === item.name
          );

          if (exists) return prev;

          return [...prev, item];
        });
      },

      removePalette: (item) => {
        setWorkspacePalette((prev) =>
          prev.filter(
            (color) =>
              !(color.family === item.family && color.name === item.name)
          )
        );
      },

      addGown: (item) => {
        setWorkspaceGowns((prev) => {
          const exists = prev.some((gown) => gown.id === item.id);

          if (exists) return prev;

          return [...prev, item];
        });
      },

      removeGown: (id) => {
        setWorkspaceGowns((prev) => prev.filter((gown) => gown.id !== id));
      },

      addMember: () => {
        setBridalMembers((prev) => [...prev, createMember()]);
      },

      updateMember: (id, field, memberValue) => {
        setBridalMembers((prev) =>
          prev.map((member) =>
            member.id === id ? { ...member, [field]: memberValue } : member
          )
        );
      },

      removeMember: (id) => {
        setBridalMembers((prev) => prev.filter((member) => member.id !== id));
      },

      clearWorkspace: () => {
        setWorkspacePalette([]);
        setWorkspaceGowns([]);
        setBridalMembers([]);
      },
    }),
    [workspacePalette, workspaceGowns, bridalMembers]
  );

  return (
    <BridalWorkspaceContext.Provider value={value}>
      {children}
    </BridalWorkspaceContext.Provider>
  );
}

export function useBridalWorkspace() {
  const context = useContext(BridalWorkspaceContext);

  if (!context) {
    throw new Error(
      "useBridalWorkspace must be used inside BridalWorkspaceProvider"
    );
  }

  return context;
}

export function BridalWorkspaceButton() {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setWorkspaceOpen(true)}
        className="fixed bottom-8 right-8 z-50 inline-flex h-[54px] items-center gap-[14px] rounded-full bg-[#15100c] px-[24px] text-[9px] font-semibold uppercase tracking-[0.42em] text-white shadow-2xl"
      >
        <span className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white/15 text-[14px]">
          ✨
        </span>
        Bridal Workspace
      </button>

      {workspaceOpen ? (
        <BridalWorkspaceModal onClose={() => setWorkspaceOpen(false)} />
      ) : null}
    </>
  );
}

function BridalWorkspaceModal({ onClose }: { onClose: () => void }) {
  const {
    workspacePalette,
    workspaceGowns,
    bridalMembers,
    removePalette,
    removeGown,
    addMember,
    updateMember,
    removeMember,
    clearWorkspace,
  } = useBridalWorkspace();

  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);

    window.setTimeout(() => {
      onClose();
    }, 300);
  };

  const copyWorkspaceLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Workspace link copied.");
    } catch {
      alert("Unable to copy link.");
    }
  };

  const shareWorkspace = async () => {
    const shareData = {
      title: "Shahsi Bridal Workspace",
      text: "Here is the bridal workspace.",
      url: window.location.href,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await copyWorkspaceLink();
  };

  return (
    <div
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-6 py-6 transition-opacity duration-300",
        isClosing ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div
        className={[
          "relative w-[min(1040px,calc(100vw-120px))] overflow-hidden rounded-[4px] bg-[#fbf8f1] text-[#15100c] shadow-[0_24px_80px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out",
          isClosing
            ? "scale-[0.96] translate-y-4 opacity-0"
            : "scale-100 translate-y-0 opacity-100",
        ].join(" ")}
      >
        <div className="relative border-b border-[#ddd5c9] px-[34px] py-[24px]">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-[24px] top-[18px] text-[28px] font-light leading-none text-[#4f4944]"
            aria-label="Close bridal workspace"
          >
            ×
          </button>

          <p className="mb-[14px] text-[10px] uppercase tracking-[0.48em] text-[#b98262]">
            — Private Bridal Workspace
          </p>

          <h2 className="font-serif text-[35px] font-semibold leading-none tracking-[-0.055em] text-[#17110d]">
            Untitled Bridal Workspace
          </h2>

          <p className="mt-[14px] text-[15px] font-light text-[#6d6760]">
            A shareable mood — palette, gowns, and party — all in one place.
          </p>
        </div>

        <div className="px-[34px] py-[30px]">
          <WorkspaceSection
            icon="🎨"
            title="Palette"
            count={`${workspacePalette.length} Items`}
            emptyText="No swatches yet. Click any color in the Atelier Swatches section to pin it here."
          >
            {workspacePalette.length > 0 ? (
              <div className="mt-[16px] flex flex-wrap gap-[10px]">
                {workspacePalette.map((item) => (
                  <button
                    key={`${item.family}-${item.name}`}
                    type="button"
                    onClick={() => removePalette(item)}
                    className="inline-flex h-[34px] items-center gap-[9px] rounded-full border border-[#d1c7bb] bg-white px-[13px] text-[9px] uppercase tracking-[0.26em] text-[#15100c] shadow-sm"
                    title="Remove from workspace"
                  >
                    <span
                      className="h-[18px] w-[18px] rounded-full border border-[#d4cabe]"
                      style={{ background: item.color }}
                    />
                    {item.family} / {item.name}
                    <span className="text-[13px] leading-none text-[#8b867f]">
                      ×
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </WorkspaceSection>

          <WorkspaceSection
            icon="▣"
            title="Gowns"
            count={`${workspaceGowns.length} Items`}
            emptyText="No gowns pinned. Use the small + Workspace button on any product card."
          >
            {workspaceGowns.length > 0 ? (
              <div className="mt-[16px] grid gap-[10px] md:grid-cols-2">
                {workspaceGowns.map((gown) => (
                  <div
                    key={gown.id}
                    className="flex items-center gap-[12px] border border-[#ddd5c9] bg-white p-[8px]"
                  >
                    <img
                      src={gown.image}
                      alt={gown.name}
                      className="h-[58px] w-[46px] object-cover"
                    />

                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate font-serif text-[16px] leading-none text-[#15100c]">
                        {gown.name}
                      </p>
                      <p className="mt-[6px] text-[10px] uppercase tracking-[0.22em] text-[#8b867f]">
                        {gown.colorName} · {gown.price}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeGown(gown.id)}
                      className="px-[8px] text-[22px] leading-none text-[#8b867f]"
                      aria-label={`Remove ${gown.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </WorkspaceSection>

          <div className="mt-[30px]">
            <div className="mb-[16px] flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <Users className="h-[20px] w-[20px] stroke-[1.5] text-[#9c968e]" />

                <h3 className="font-serif text-[27px] leading-none text-[#15100c]">
                  Bridal Party
                </h3>

                <p className="ml-[-5px] text-[9px] uppercase tracking-[0.42em] text-[#8b867f]">
                  {bridalMembers.length} Items
                </p>
              </div>
            </div>

            {bridalMembers.length > 0 ? (
              <div className="space-y-[10px]">
                {bridalMembers.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[1fr_150px_130px_1.2fr_32px] gap-[10px] border border-[#ddd5c9] bg-white p-[10px]"
                  >
                    <input
                      value={member.name}
                      onChange={(event) =>
                        updateMember(member.id, "name", event.target.value)
                      }
                      placeholder="Name"
                      className="h-[42px] border border-[#ddd5c9] bg-[#fbf8f1] px-[12px] text-[13px] outline-none"
                    />

                    <select
                      value={member.role}
                      onChange={(event) =>
                        updateMember(member.id, "role", event.target.value)
                      }
                      className="h-[42px] border border-[#ddd5c9] bg-[#fbf8f1] px-[12px] text-[13px] outline-none"
                    >
                      <option>Bridesmaid</option>
                      <option>Maid of Honor</option>
                      <option>Bride</option>
                      <option>Mother of Bride</option>
                      <option>Wedding Guest</option>
                    </select>

                    <input
                      value={member.size}
                      onChange={(event) =>
                        updateMember(member.id, "size", event.target.value)
                      }
                      placeholder="Size"
                      className="h-[42px] border border-[#ddd5c9] bg-[#fbf8f1] px-[12px] text-[13px] outline-none"
                    />

                    <input
                      value={member.notes}
                      onChange={(event) =>
                        updateMember(member.id, "notes", event.target.value)
                      }
                      placeholder="Notes"
                      className="h-[42px] border border-[#ddd5c9] bg-[#fbf8f1] px-[12px] text-[13px] outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="text-[22px] leading-none text-[#8b867f]"
                      aria-label="Remove member"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={addMember}
              className="mt-[12px] flex h-[52px] w-full items-center justify-center border border-dashed border-[#bfb5a8] text-[11px] uppercase tracking-[0.4em] text-[#8b6b57]"
            >
              <span className="mr-[12px] text-[22px] leading-none text-[#15100c]">
                +
              </span>
              Add Bridal Party Member
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#ddd5c9] bg-[#fbf8f1] px-[34px] py-[16px]">
          <button
            type="button"
            onClick={clearWorkspace}
            className="inline-flex items-center gap-[10px] text-[10px] uppercase tracking-[0.36em] text-[#8b867f]"
          >
            🗑 Clear
          </button>

          <div className="flex gap-[14px]">
            <button
              type="button"
              onClick={copyWorkspaceLink}
              className="inline-flex h-[48px] items-center justify-center border border-[#cfc6ba] px-[32px] text-[10px] uppercase tracking-[0.34em] text-[#15100c]"
            >
              ⧉ Copy Link
            </button>

            <button
              type="button"
              onClick={shareWorkspace}
              className="inline-flex h-[48px] items-center justify-center bg-[#15100c] px-[36px] text-[10px] uppercase tracking-[0.34em] text-white"
            >
              ⤴ Share With Party
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkspaceSection({
  icon,
  title,
  count,
  emptyText,
  children,
}: {
  icon: string;
  title: string;
  count: string;
  emptyText: string;
  children?: React.ReactNode;
}) {
  const hasChildren = Boolean(children);

  return (
    <div className="mb-[30px]">
      <div className="mb-[14px] flex items-center justify-between">
        <div className="flex items-center gap-[12px]">
          <span className="text-[20px] text-[#9c968e]">{icon}</span>

          <h3 className="font-serif text-[27px] leading-none text-[#15100c]">
            {title}
          </h3>
        </div>

        <p className="text-[9px] uppercase tracking-[0.42em] text-[#8b867f]">
          {count}
        </p>
      </div>

      {hasChildren ? (
        children
      ) : (
        <p className="text-[16px] italic font-light text-[#8b867f]">
          {emptyText}
        </p>
      )}
    </div>
  );
}

export function makeWorkspaceGown(product: {
  tag: string;
  name: string;
  price: string;
  fabric: string;
  colorName: string;
  image: string;
}): WorkspaceGown {
  return {
    id: product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    tag: product.tag,
    name: product.name,
    price: product.price,
    fabric: product.fabric,
    colorName: product.colorName,
    image: product.image,
  };
}