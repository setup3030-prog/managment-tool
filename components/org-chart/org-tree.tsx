"use client";
import { AnimatePresence, motion } from "framer-motion";
import { OrgNode } from "./org-node";
import type { OrgEmployee } from "@/types";

interface TreeNode {
  employee: OrgEmployee;
  children: TreeNode[];
}

function buildTree(employees: OrgEmployee[], parentId?: string): TreeNode[] {
  return employees
    .filter(e => e.reportsTo === parentId)
    .map(e => ({ employee: e, children: buildTree(employees, e.id) }));
}

interface OrgTreeProps {
  employees: OrgEmployee[];
  searchQuery: string;
  deptFilter: string;
  collapsed: Set<string>;
  onCollapsedChange: (next: Set<string>) => void;
  onCardClick: (employee: OrgEmployee) => void;
}

export function OrgTree({ employees, searchQuery, deptFilter, collapsed, onCollapsedChange, onCardClick }: OrgTreeProps) {
  function toggle(id: string) {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id); else next.add(id);
    onCollapsedChange(next);
  }

  // Flat grid when searching or filtering by department
  if (searchQuery || deptFilter !== "ALL") {
    const filtered = employees.filter(e => {
      const matchDept = deptFilter === "ALL" || e.department === deptFilter;
      const matchSearch = !searchQuery ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.position.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });

    return (
      <div className="flex flex-wrap gap-4 justify-center p-8">
        {filtered.map(e => (
          <OrgNode
            key={e.id}
            employee={e}
            directReports={0}
            collapsed={false}
            onToggle={() => {}}
            onCardClick={onCardClick}
            highlighted={false}
            dimmed={false}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground py-12">Brak wyników dla podanych filtrów.</p>
        )}
      </div>
    );
  }

  const tree = buildTree(employees);

  function renderNode(node: TreeNode): React.ReactNode {
    const isCollapsed = collapsed.has(node.employee.id);
    const hasChildren = node.children.length > 0;

    return (
      <div key={node.employee.id} className="flex flex-col items-center">
        <OrgNode
          employee={node.employee}
          directReports={node.children.length}
          collapsed={isCollapsed}
          onToggle={() => toggle(node.employee.id)}
          onCardClick={onCardClick}
          highlighted={false}
          dimmed={false}
        />

        <AnimatePresence>
          {hasChildren && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {/* Vertical stem from node down to horizontal bar */}
              <div className="w-px h-6 bg-border mx-auto" />

              {/* Children row */}
              <div className="relative flex items-start gap-0">
                {node.children.map((child, idx) => (
                  <div key={child.employee.id} className="relative flex flex-col items-center px-4">
                    {/* Horizontal bar segment */}
                    <div
                      className="absolute top-0 h-px bg-border"
                      style={{
                        left: idx === 0 ? "50%" : "0",
                        right: idx === node.children.length - 1 ? "50%" : "0",
                      }}
                    />
                    {/* Vertical stem down to child */}
                    <div className="w-px h-6 bg-border" />
                    {renderNode(child)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-8 min-w-max">
      {tree.map(node => renderNode(node))}
    </div>
  );
}
