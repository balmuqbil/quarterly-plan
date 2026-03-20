'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageShell } from '@/components/layout/page-shell';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  FolderTree,
  Layers,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getDomainsByPracticeArea,
  getSubdomains,
  getSkills,
  createDomain,
  updateDomain,
  deleteDomain,
  createSubdomain,
  updateSubdomain,
  deleteSubdomain,
  createSkill,
  updateSkill,
  deleteSkill,
} from '@/lib/data/store';
import type {
  CompetencyDomain,
  CompetencySubdomain,
  Skill,
  PracticeArea,
} from '@/lib/types';
import { PRACTICE_AREA_LABELS } from '@/lib/types';

// ============ Types ============

type SelectedItemType = 'domain' | 'subdomain' | 'skill';

interface SelectedItem {
  type: SelectedItemType;
  id: string;
}

interface TreeData {
  domains: CompetencyDomain[];
  subdomains: Record<string, CompetencySubdomain[]>;
  skills: Record<string, Skill[]>;
}

const PRACTICE_AREAS: PracticeArea[] = [
  'software_development',
  'application_integration',
  'system_integration',
];

// ============ Helper to load tree data ============

function loadTreeData(practiceArea: PracticeArea): TreeData {
  const domains = getDomainsByPracticeArea(practiceArea);
  const subdomains: Record<string, CompetencySubdomain[]> = {};
  const skills: Record<string, Skill[]> = {};

  for (const domain of domains) {
    const subs = getSubdomains(domain.id);
    subdomains[domain.id] = subs;
    for (const sub of subs) {
      skills[sub.id] = getSkills(sub.id);
    }
  }

  return { domains, subdomains, skills };
}

// ============ Tree Item Components ============

function SkillItem({
  skill,
  isSelected,
  onSelect,
  onDelete,
}: {
  skill: Skill;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group flex items-center gap-2 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
      onClick={onSelect}
    >
      <BookOpen className="size-3.5 shrink-0 text-slate-400" />
      <span className="flex-1 truncate">{skill.name}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <Pencil className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}

function SubdomainItem({
  subdomain,
  skills,
  selectedItem,
  onSelect,
  onDeleteSubdomain,
  onSelectSkill,
  onDeleteSkill,
  onAddSkill,
}: {
  subdomain: CompetencySubdomain;
  skills: Skill[];
  selectedItem: SelectedItem | null;
  onSelect: () => void;
  onDeleteSubdomain: () => void;
  onSelectSkill: (id: string) => void;
  onDeleteSkill: (id: string) => void;
  onAddSkill: () => void;
}) {
  const [open, setOpen] = useState(false);
  const isSelected =
    selectedItem?.type === 'subdomain' && selectedItem.id === subdomain.id;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={`group flex items-center gap-1 rounded-md px-2 py-1.5 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
        onClick={onSelect}
      >
        <CollapsibleTrigger
          className="p-0.5 rounded hover:bg-slate-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {open ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </CollapsibleTrigger>
        <Layers className="size-3.5 shrink-0 text-slate-400" />
        <span className="flex-1 truncate text-sm">{subdomain.name}</span>
        <Badge variant="secondary" className="text-[10px] px-1.5 h-4 min-w-[1.25rem] justify-center">
          {skills.length}
        </Badge>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSubdomain();
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <div className="ml-6 border-l border-slate-200 pl-2 mt-0.5">
          {skills.map((skill) => (
            <SkillItem
              key={skill.id}
              skill={skill}
              isSelected={
                selectedItem?.type === 'skill' && selectedItem.id === skill.id
              }
              onSelect={() => onSelectSkill(skill.id)}
              onDelete={() => onDeleteSkill(skill.id)}
            />
          ))}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-primary transition-colors w-full"
            onClick={onAddSkill}
          >
            <Plus className="size-3" />
            Add Skill
          </button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DomainItem({
  domain,
  subdomains,
  skills,
  selectedItem,
  onSelect,
  onDeleteDomain,
  onSelectSubdomain,
  onDeleteSubdomain,
  onSelectSkill,
  onDeleteSkill,
  onAddSubdomain,
  onAddSkill,
}: {
  domain: CompetencyDomain;
  subdomains: CompetencySubdomain[];
  skills: Record<string, Skill[]>;
  selectedItem: SelectedItem | null;
  onSelect: () => void;
  onDeleteDomain: () => void;
  onSelectSubdomain: (id: string) => void;
  onDeleteSubdomain: (id: string) => void;
  onSelectSkill: (id: string) => void;
  onDeleteSkill: (id: string) => void;
  onAddSubdomain: () => void;
  onAddSkill: (subdomainId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const isSelected =
    selectedItem?.type === 'domain' && selectedItem.id === domain.id;
  const totalSubdomains = subdomains.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div
        className={`group flex items-center gap-1 rounded-md px-2 py-2 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-slate-800 hover:bg-slate-100'
        }`}
        onClick={onSelect}
      >
        <CollapsibleTrigger
          className="p-0.5 rounded hover:bg-slate-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {open ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </CollapsibleTrigger>
        <FolderTree className="size-4 shrink-0 text-slate-500" />
        <span className="flex-1 truncate font-medium text-sm">
          {domain.name}
        </span>
        <Badge variant="secondary" className="text-[10px] px-1.5 h-4 min-w-[1.25rem] justify-center">
          {totalSubdomains}
        </Badge>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteDomain();
            }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <div className="ml-4 border-l border-slate-200 pl-2 mt-0.5">
          {subdomains.map((sub) => (
            <SubdomainItem
              key={sub.id}
              subdomain={sub}
              skills={skills[sub.id] || []}
              selectedItem={selectedItem}
              onSelect={() => onSelectSubdomain(sub.id)}
              onDeleteSubdomain={() => onDeleteSubdomain(sub.id)}
              onSelectSkill={onSelectSkill}
              onDeleteSkill={onDeleteSkill}
              onAddSkill={() => onAddSkill(sub.id)}
            />
          ))}
          <button
            className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-slate-500 hover:text-primary transition-colors w-full"
            onClick={onAddSubdomain}
          >
            <Plus className="size-3" />
            Add Subdomain
          </button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============ Edit Form ============

function EditForm({
  selectedItem,
  treeData,
  activePracticeArea,
  onSave,
  onCancel,
}: {
  selectedItem: SelectedItem | null;
  treeData: TreeData;
  activePracticeArea: PracticeArea;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isNew, setIsNew] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedItem) return;

    if (selectedItem.id.startsWith('new-domain')) {
      setIsNew(true);
      setName('');
      setDescription('');
      setSortOrder(treeData.domains.length + 1);
      setParentId(null);
      return;
    }

    if (selectedItem.id.startsWith('new-subdomain:')) {
      setIsNew(true);
      setName('');
      setDescription('');
      const domId = selectedItem.id.split(':')[1];
      setParentId(domId);
      const subs = treeData.subdomains[domId] || [];
      setSortOrder(subs.length + 1);
      return;
    }

    if (selectedItem.id.startsWith('new-skill:')) {
      setIsNew(true);
      setName('');
      setDescription('');
      const subId = selectedItem.id.split(':')[1];
      setParentId(subId);
      const sk = treeData.skills[subId] || [];
      setSortOrder(sk.length + 1);
      return;
    }

    setIsNew(false);

    if (selectedItem.type === 'domain') {
      const domain = treeData.domains.find((d) => d.id === selectedItem.id);
      if (domain) {
        setName(domain.name);
        setDescription(domain.description);
        setSortOrder(domain.sortOrder);
      }
    } else if (selectedItem.type === 'subdomain') {
      for (const subs of Object.values(treeData.subdomains)) {
        const sub = subs.find((s) => s.id === selectedItem.id);
        if (sub) {
          setName(sub.name);
          setDescription(sub.description);
          setSortOrder(sub.sortOrder);
          setParentId(sub.domainId);
          break;
        }
      }
    } else if (selectedItem.type === 'skill') {
      for (const sk of Object.values(treeData.skills)) {
        const skill = sk.find((s) => s.id === selectedItem.id);
        if (skill) {
          setName(skill.name);
          setDescription(skill.description);
          setSortOrder(skill.sortOrder);
          setParentId(skill.subdomainId);
          break;
        }
      }
    }
  }, [selectedItem, treeData, activePracticeArea]);

  if (!selectedItem) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
        <FolderTree className="size-12 stroke-1" />
        <div className="text-center">
          <p className="text-sm font-medium">No item selected</p>
          <p className="text-xs mt-1">
            Select an item from the tree to edit, or use the + buttons to add
            new items.
          </p>
        </div>
      </div>
    );
  }

  const typeLabel =
    selectedItem.type === 'domain'
      ? 'Domain'
      : selectedItem.type === 'subdomain'
        ? 'Subdomain'
        : 'Skill';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!selectedItem) return;

    if (isNew) {
      if (selectedItem.type === 'domain') {
        createDomain({
          name: name.trim(),
          description: description.trim(),
          practiceArea: activePracticeArea,
          sortOrder,
        });
        toast.success('Domain created successfully');
      } else if (selectedItem.type === 'subdomain' && parentId) {
        createSubdomain({
          domainId: parentId,
          name: name.trim(),
          description: description.trim(),
          sortOrder,
        });
        toast.success('Subdomain created successfully');
      } else if (selectedItem.type === 'skill' && parentId) {
        createSkill({
          subdomainId: parentId,
          name: name.trim(),
          description: description.trim(),
          sortOrder,
        });
        toast.success('Skill created successfully');
      }
    } else {
      if (selectedItem.type === 'domain') {
        updateDomain(selectedItem.id, {
          name: name.trim(),
          description: description.trim(),
          sortOrder,
        });
        toast.success('Domain updated successfully');
      } else if (selectedItem.type === 'subdomain') {
        updateSubdomain(selectedItem.id, {
          name: name.trim(),
          description: description.trim(),
          sortOrder,
        });
        toast.success('Subdomain updated successfully');
      } else if (selectedItem.type === 'skill') {
        updateSkill(selectedItem.id, {
          name: name.trim(),
          description: description.trim(),
          sortOrder,
        });
        toast.success('Skill updated successfully');
      }
    }

    onSave();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          {isNew ? `New ${typeLabel}` : `Edit ${typeLabel}`}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isNew
            ? `Create a new ${typeLabel.toLowerCase()} in the competency framework.`
            : `Modify the ${typeLabel.toLowerCase()} details below.`}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item-name">Name</Label>
          <Input
            id="item-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${typeLabel.toLowerCase()} name`}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item-description">Description</Label>
          <textarea
            id="item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Enter ${typeLabel.toLowerCase()} description`}
            rows={3}
            className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
          />
        </div>

        {selectedItem.type === 'domain' && !isNew && (
          <div className="flex flex-col gap-1.5">
            <Label>Practice Area</Label>
            <div className="text-sm text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">
              {PRACTICE_AREA_LABELS[activePracticeArea]}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="item-sort-order">Sort Order</Label>
          <Input
            id="item-sort-order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit">{isNew ? 'Create' : 'Save Changes'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ============ Delete Confirmation Dialog ============

function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemType,
  itemName,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: string;
  itemName: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {itemType}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{itemName}&quot;?
            {itemType === 'Domain' &&
              ' This will also delete all subdomains and skills within this domain.'}
            {itemType === 'Subdomain' &&
              ' This will also delete all skills within this subdomain.'}
            {' '}This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ Main Page ============

export default function CompetenciesPage() {
  const [loading, setLoading] = useState(true);
  const [activePracticeArea, setActivePracticeArea] =
    useState<PracticeArea>('software_development');
  const [treeData, setTreeData] = useState<TreeData>({
    domains: [],
    subdomains: {},
    skills: {},
  });
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: SelectedItemType;
    id: string;
    name: string;
  } | null>(null);

  const refreshData = useCallback(() => {
    const data = loadTreeData(activePracticeArea);
    setTreeData(data);
  }, [activePracticeArea]);

  useEffect(() => {
    refreshData();
    setLoading(false);
  }, [refreshData]);

  // Reset selection when practice area changes
  useEffect(() => {
    setSelectedItem(null);
  }, [activePracticeArea]);

  function handleDelete(type: SelectedItemType, id: string) {
    let name = '';
    if (type === 'domain') {
      name = treeData.domains.find((d) => d.id === id)?.name || '';
    } else if (type === 'subdomain') {
      for (const subs of Object.values(treeData.subdomains)) {
        const sub = subs.find((s) => s.id === id);
        if (sub) {
          name = sub.name;
          break;
        }
      }
    } else {
      for (const sk of Object.values(treeData.skills)) {
        const skill = sk.find((s) => s.id === id);
        if (skill) {
          name = skill.name;
          break;
        }
      }
    }
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;

    const { type, id } = deleteTarget;
    let success = false;

    if (type === 'domain') {
      success = deleteDomain(id);
      if (success) toast.success('Domain deleted successfully');
    } else if (type === 'subdomain') {
      success = deleteSubdomain(id);
      if (success) toast.success('Subdomain deleted successfully');
    } else {
      success = deleteSkill(id);
      if (success) toast.success('Skill deleted successfully');
    }

    if (success) {
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
      refreshData();
    }

    setDeleteTarget(null);
  }

  function handleAddDomain() {
    setSelectedItem({ type: 'domain', id: 'new-domain' });
  }

  function handleAddSubdomain(domainId: string) {
    setSelectedItem({
      type: 'subdomain',
      id: `new-subdomain:${domainId}`,
    });
  }

  function handleAddSkill(subdomainId: string) {
    setSelectedItem({
      type: 'skill',
      id: `new-skill:${subdomainId}`,
    });
  }

  function handleSave() {
    refreshData();
    setSelectedItem(null);
  }

  function handleCancel() {
    setSelectedItem(null);
  }

  if (loading) {
    return (
      <PageShell title="Competency Framework">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      </PageShell>
    );
  }

  const deleteTypeLabel = deleteTarget
    ? deleteTarget.type === 'domain'
      ? 'Domain'
      : deleteTarget.type === 'subdomain'
        ? 'Subdomain'
        : 'Skill'
    : '';

  return (
    <PageShell title="Competency Framework">
      <div className="flex gap-6 h-[calc(100vh-10rem)]">
        {/* Left Panel - Tree View */}
        <div className="w-1/3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">
              Competency Hierarchy
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Browse and manage domains, subdomains, and skills.
            </p>
          </div>

          <Tabs
            defaultValue="software_development"
            onValueChange={(value) =>
              setActivePracticeArea(value as PracticeArea)
            }
            className="flex-1 flex flex-col min-h-0"
          >
            <div className="px-3 pt-3">
              <TabsList className="w-full">
                {PRACTICE_AREAS.map((pa) => (
                  <TabsTrigger key={pa} value={pa} className="text-xs flex-1">
                    {pa === 'software_development'
                      ? 'Software Dev'
                      : pa === 'application_integration'
                        ? 'App Integration'
                        : 'System Integration'}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {PRACTICE_AREAS.map((pa) => (
              <TabsContent key={pa} value={pa} className="flex-1 min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-3 flex flex-col gap-0.5">
                    {treeData.domains.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <FolderTree className="size-8 mx-auto mb-2 stroke-1" />
                        <p className="text-xs">
                          No domains yet. Add one to get started.
                        </p>
                      </div>
                    ) : (
                      treeData.domains.map((domain) => (
                        <DomainItem
                          key={domain.id}
                          domain={domain}
                          subdomains={treeData.subdomains[domain.id] || []}
                          skills={treeData.skills}
                          selectedItem={selectedItem}
                          onSelect={() =>
                            setSelectedItem({
                              type: 'domain',
                              id: domain.id,
                            })
                          }
                          onDeleteDomain={() =>
                            handleDelete('domain', domain.id)
                          }
                          onSelectSubdomain={(id) =>
                            setSelectedItem({ type: 'subdomain', id })
                          }
                          onDeleteSubdomain={(id) =>
                            handleDelete('subdomain', id)
                          }
                          onSelectSkill={(id) =>
                            setSelectedItem({ type: 'skill', id })
                          }
                          onDeleteSkill={(id) => handleDelete('skill', id)}
                          onAddSubdomain={() =>
                            handleAddSubdomain(domain.id)
                          }
                          onAddSkill={handleAddSkill}
                        />
                      ))
                    )}
                    <button
                      className="flex items-center gap-1.5 px-2 py-2 text-xs font-medium text-slate-500 hover:text-primary transition-colors w-full rounded-md hover:bg-slate-50 mt-1"
                      onClick={handleAddDomain}
                    >
                      <Plus className="size-3.5" />
                      Add Domain
                    </button>
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right Panel - Edit Form */}
        <div className="w-2/3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-900">Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an item to view or edit its properties.
            </p>
          </div>
          <div className="p-6">
            <EditForm
              selectedItem={selectedItem}
              treeData={treeData}
              activePracticeArea={activePracticeArea}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </div>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemType={deleteTypeLabel}
        itemName={deleteTarget?.name || ''}
        onConfirm={confirmDelete}
      />
    </PageShell>
  );
}
