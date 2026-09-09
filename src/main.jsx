import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

/*
 * API integration
 * ----------------
 * Vite proxies /api -> http://localhost:3000/api during development.
 *
 * Endpoints:
 * GET /api/hospitals
 * GET /api/users
 * GET /api/rolemasters
 * GET /api/users-relationship
 *
 * The normalizers below accept either:
 *   - a direct array
 *   - { data: [...] }
 *   - { hospitals: [...] }, { users: [...] }, etc.
 *
 * This keeps the UI tolerant of common API response wrappers.
 */

const API_BASE = "/api";

const ENDPOINTS = {
  hospitals: `${API_BASE}/hospitals`,
  users: `${API_BASE}/users`,
  roles: `${API_BASE}/role-masters`,
  relationships: `${API_BASE}/users-relationship`
};

function unwrapArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  return [];
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`GET ${url} failed with ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function loadHospitalData() {
  const [hospitalsResponse, usersResponse, rolesResponse, relationshipsResponse] =
    await Promise.all([
      getJson(ENDPOINTS.hospitals),
      getJson(ENDPOINTS.users),
      getJson(ENDPOINTS.roles),
      getJson(ENDPOINTS.relationships)
    ]);

  return {
    hospitals: unwrapArray(hospitalsResponse, ["hospitals"]),
    users: unwrapArray(usersResponse, ["users"]),
    roles: unwrapArray(rolesResponse, ["roles", "roleMasters"]),
    relationships: unwrapArray(relationshipsResponse, [
      "relationships",
      "userRelationships"
    ])
  };
}

function normalizeHospital(hospital) {
  return {
    id: hospital.id,
    hospital_name: hospital.hospitalName ?? hospital.hospital_name ?? "",
    hospital_code: hospital.hospitalCode ?? hospital.hospital_code ?? "",
    address: hospital.address ?? "",
    city: hospital.city ?? "",
    state: hospital.state ?? "",
    is_active: hospital.isActive ?? hospital.is_active ?? true
  };
}

function normalizeRole(role) {
  return {
    id: role.id,
    role_name: role.roleName ?? role.role_name ?? "",
    role_code: role.roleCode ?? role.role_code ?? "",
    parent_role_id: role.parentRoleId ?? role.parent_role_id ?? null
  };
}

function normalizeUser(user) {
  return {
    id: user.id,
    hospital_id: user.hospitalId ?? user.hospital_id,
    role_id: user.roleId ?? user.role_id,
    username: user.userName ?? user.username ?? "",
    full_name: user.fullName ?? user.full_name ?? "",
    email: user.email ?? "",
    is_active: user.isActive ?? user.is_active ?? true
  };
}

function normalizeRelationship(relationship) {
  return {
    id: relationship.id,
    hospital_id: relationship.hospitalId ?? relationship.hospital_id,
    senior_user_id: relationship.seniorId ?? relationship.seniorUserId ?? relationship.senior_user_id,
    junior_user_id: relationship.juniorId ?? relationship.juniorUserId ?? relationship.junior_user_id
  };
}

function App() {
  const [data, setData] = useState({
    hospitals: [],
    roles: [],
    users: [],
    relationships: []
  });
  const [selectedHospitalId, setSelectedHospitalId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await loadHospitalData();

      const normalized = {
        hospitals: result.hospitals.map(normalizeHospital),
        roles: result.roles.map(normalizeRole),
        users: result.users.map(normalizeUser),
        relationships: result.relationships.map(normalizeRelationship)
      };

      setData(normalized);

      if (normalized.hospitals.length) {
        setSelectedHospitalId((current) =>
          normalized.hospitals.some((h) => String(h.id) === String(current))
            ? current
            : normalized.hospitals[0].id
        );
      }

      if (normalized.users.length) {
        setSelectedUserId((current) =>
          normalized.users.some((u) => String(u.id) === String(current))
            ? current
            : normalized.users[0].id
        );

        setExpanded(new Set(normalized.users.map((u) => u.id)));
      }
    } catch (err) {
      setError(err.message || "Unable to load API data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const hospital = data.hospitals.find(
    (item) => String(item.id) === String(selectedHospitalId)
  );

  const roleById = useMemo(
    () => Object.fromEntries(data.roles.map((role) => [String(role.id), role])),
    [data.roles]
  );

  const userById = useMemo(
    () => Object.fromEntries(data.users.map((user) => [String(user.id), user])),
    [data.users]
  );

  const childrenByUserId = useMemo(() => {
    const map = {};

    for (const relationship of data.relationships) {
      const seniorId = String(relationship.senior_user_id);
      if (!map[seniorId]) map[seniorId] = [];
      map[seniorId].push(relationship.junior_user_id);
    }

    return map;
  }, [data.relationships]);

  const hospitalUsers = useMemo(
    () =>
      data.users.filter(
        (user) => !hospital || String(user.hospital_id) === String(hospital.id)
      ),
    [data.users, hospital]
  );

  const hospitalRelationships = useMemo(
    () =>
      data.relationships.filter(
        (relationship) =>
          !hospital ||
          String(relationship.hospital_id) === String(hospital.id)
      ),
    [data.relationships, hospital]
  );

  const rootUsers = useMemo(() => {
    const juniorIds = new Set(
      hospitalRelationships.map((relationship) =>
        String(relationship.junior_user_id)
      )
    );

    return hospitalUsers.filter((user) => !juniorIds.has(String(user.id)));
  }, [hospitalUsers, hospitalRelationships]);

  const selectedUser =
    selectedUserId != null ? userById[String(selectedUserId)] : null;

  const toggle = (id) => {
    setExpanded((current) => {
      const next = new Set(current);
      const key = String(id);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const selectUser = (id) => setSelectedUserId(id);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">ORGANIZATION VIEW</div>
          <h1>Hospital User Hierarchy</h1>
          <p>Live API data · Users, roles and senior → junior relationships</p>
        </div>

        <div className="header-actions">
          <div className={`api-status ${error ? "offline" : loading ? "loading" : "online"}`}>
            <span className="status-dot" />
            {loading ? "Loading API" : error ? "API error" : "API connected"}
          </div>

          <button className="refresh-button" onClick={fetchData} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </header>

      <main className="content">
        {error && (
          <div className="error-banner">
            <strong>Could not load API data.</strong>
            <span>{error}</span>
            <small>
              Make sure the backend is running at <code>http://localhost:3000</code>.
            </small>
          </div>
        )}

        {hospital ? (
          <section className="hospital-card">
            <div className="hospital-icon">H</div>

            <div className="hospital-info">
              <div className="label">HOSPITAL</div>
              <h2>{hospital.hospital_name}</h2>

              <div className="hospital-meta">
                <span><b>ID:</b> {hospital.id}</span>
                <span><b>Code:</b> {hospital.hospital_code}</span>
                <span>
                  {[hospital.address, hospital.city, hospital.state]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>

            {data.hospitals.length > 1 && (
              <select
                className="hospital-select"
                value={selectedHospitalId ?? ""}
                onChange={(event) => setSelectedHospitalId(event.target.value)}
              >
                {data.hospitals.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.hospital_name}
                  </option>
                ))}
              </select>
            )}

            <div className="stats">
              <div>
                <strong>{hospitalUsers.length}</strong>
                <span>Users</span>
              </div>
              <div>
                <strong>{data.roles.length}</strong>
                <span>Roles</span>
              </div>
              <div>
                <strong>{hospitalRelationships.length}</strong>
                <span>Relations</span>
              </div>
            </div>
          </section>
        ) : !loading ? (
          <div className="empty-page">No hospitals returned by the API.</div>
        ) : null}

        <div className="grid">
          <section className="panel hierarchy-panel">
            <div className="panel-header">
              <div>
                <h3>Hierarchy</h3>
                <p>Click a user to inspect details</p>
              </div>

              <input
                className="search"
                placeholder="Search user, role or ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="legend">
              <span><i className="legend-line" /> senior → junior</span>
              <span><i className="legend-admin" /> root user</span>
            </div>

            <div className="tree">
              {loading ? (
                <div className="tree-loading">Loading hierarchy…</div>
              ) : hospital ? (
                <div className="tree-root">
                  <div className="hospital-node">
                    <span className="node-symbol">⌂</span>
                    <div>
                      <strong>{hospital.hospital_name}</strong>
                      <small>Hospital ID: {hospital.id}</small>
                    </div>
                  </div>

                  <div className="tree-children">
                    {rootUsers.map((user) => (
                      <UserNode
                        key={user.id}
                        user={user}
                        roleById={roleById}
                        userById={userById}
                        childrenByUserId={childrenByUserId}
                        expanded={expanded}
                        toggle={toggle}
                        selectedUserId={selectedUserId}
                        selectUser={selectUser}
                        search={search}
                        hospitalId={hospital.id}
                      />
                    ))}

                    {!rootUsers.some((user) =>
                      isUserOrDescendantMatch(
                        user,
                        userById,
                        childrenByUserId,
                        roleById,
                        search
                      )
                    ) && search && (
                      <div className="empty-tree">No matching users.</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="empty-tree">No hierarchy data.</div>
              )}
            </div>
          </section>

          <aside className="panel details-panel">
            {selectedUser ? (
              <UserDetails
                user={selectedUser}
                role={roleById[String(selectedUser.role_id)]}
                userById={userById}
                roleById={roleById}
                relationships={hospitalRelationships}
              />
            ) : (
              <div className="empty-page">Select a user.</div>
            )}
          </aside>
        </div>

        <section className="panel roles-panel">
          <div className="panel-header">
            <div>
              <h3>Role structure</h3>
              <p>Role hierarchy from role_master.parent_role_id</p>
            </div>
          </div>

          <div className="role-grid">
            {data.roles.map((role) => {
              const parent = role.parent_role_id
                ? roleById[String(role.parent_role_id)]
                : null;

              const count = hospitalUsers.filter(
                (user) => String(user.role_id) === String(role.id)
              ).length;

              return (
                <div className="role-card" key={role.id}>
                  <div className="role-id">ROLE {role.id}</div>
                  <strong>{role.role_name}</strong>
                  <code>{role.role_code}</code>

                  <div className="role-parent">
                    {parent ? `Parent: ${parent.role_name}` : "Top-level role"}
                    <span>{count} user{count !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel relationships-panel">
          <div className="panel-header">
            <div>
              <h3>Senior / Junior relationships</h3>
              <p>Directly mapped from user_relationship</p>
            </div>
          </div>

          <div className="relationship-list">
            {hospitalRelationships.map((relationship) => {
              const senior = userById[String(relationship.senior_user_id)];
              const junior = userById[String(relationship.junior_user_id)];

              if (!senior || !junior) return null;

              return (
                <div className="relationship-row" key={relationship.id}>
                  <span className="rel-id">#{relationship.id}</span>

                  <UserPill
                    user={senior}
                    role={roleById[String(senior.role_id)]}
                    onClick={() => selectUser(senior.id)}
                  />

                  <span className="arrow">→</span>

                  <UserPill
                    user={junior}
                    role={roleById[String(junior.role_id)]}
                    onClick={() => selectUser(junior.id)}
                  />

                  <span className="hospital-tag">
                    Hospital {relationship.hospital_id}
                  </span>
                </div>
              );
            })}

            {!hospitalRelationships.length && !loading && (
              <div className="empty">No user relationships returned by the API.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function isUserMatch(user, roleById, search) {
  const q = search.trim().toLowerCase();
  if (!q) return true;

  const role = roleById[String(user.role_id)];

  return (
    String(user.id).toLowerCase().includes(q) ||
    user.full_name.toLowerCase().includes(q) ||
    user.username.toLowerCase().includes(q) ||
    role?.role_name?.toLowerCase().includes(q) ||
    role?.role_code?.toLowerCase().includes(q)
  );
}

function isUserOrDescendantMatch(user, userById, childrenByUserId, roleById, search) {
  if (isUserMatch(user, roleById, search)) return true;

  const children = childrenByUserId[String(user.id)] || [];

  return children.some((childId) => {
    const child = userById[String(childId)];
    return (
      child &&
      isUserOrDescendantMatch(
        child,
        userById,
        childrenByUserId,
        roleById,
        search
      )
    );
  });
}

function UserNode({
  user,
  roleById,
  userById,
  childrenByUserId,
  expanded,
  toggle,
  selectedUserId,
  selectUser,
  search
}) {
  const role = roleById[String(user.role_id)];
  const children = (childrenByUserId[String(user.id)] || [])
    .map((id) => userById[String(id)])
    .filter(Boolean);

  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(String(user.id));
  const visible = isUserOrDescendantMatch(
    user,
    userById,
    childrenByUserId,
    roleById,
    search
  );

  if (!visible) return null;

  return (
    <div className="tree-branch">
      <div
        className={`user-node ${
          String(selectedUserId) === String(user.id) ? "selected" : ""
        }`}
        onClick={() => selectUser(user.id)}
      >
        {hasChildren ? (
          <button
            className="expand"
            onClick={(event) => {
              event.stopPropagation();
              toggle(user.id);
            }}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "−" : "+"}
          </button>
        ) : (
          <span className="expand-placeholder" />
        )}

        <div className="avatar">{user.full_name.charAt(0)}</div>

        <div className="user-node-main">
          <strong>{user.full_name}</strong>
          <div className="node-sub">
            <span className="id-chip">USER ID: {user.id}</span>
            <span>{role?.role_name || "Unknown role"}</span>
          </div>
        </div>

        <span className="role-code">{role?.role_code || "—"}</span>
      </div>

      {hasChildren && isExpanded && (
        <div className="nested-children">
          {children.map((child) => (
            <UserNode
              key={child.id}
              user={child}
              roleById={roleById}
              userById={userById}
              childrenByUserId={childrenByUserId}
              expanded={expanded}
              toggle={toggle}
              selectedUserId={selectedUserId}
              selectUser={selectUser}
              search={search}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UserDetails({ user, role, userById, roleById, relationships }) {
  const seniorRelations = relationships.filter(
    (relationship) =>
      String(relationship.junior_user_id) === String(user.id)
  );

  const juniorRelations = relationships.filter(
    (relationship) =>
      String(relationship.senior_user_id) === String(user.id)
  );

  return (
    <>
      <div className="details-title">
        <div className="large-avatar">{user.full_name.charAt(0)}</div>

        <div>
          <div className="label">USER DETAILS</div>
          <h3>{user.full_name}</h3>
          <span className="active-pill">
            ● {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <div className="detail-grid">
        <Detail label="User ID" value={user.id} mono />
        <Detail label="Username" value={user.username} mono />
        <Detail label="Role ID" value={user.role_id} mono />
        <Detail label="Role" value={role?.role_name || "Unknown"} />
        <Detail label="Email" value={user.email || "—"} />
        <Detail label="Hospital ID" value={user.hospital_id} mono />
      </div>

      <div className="relation-section">
        <h4>Senior user</h4>

        {seniorRelations.length
          ? seniorRelations.map((relationship) => {
              const senior = userById[String(relationship.senior_user_id)];
              if (!senior) return null;

              return (
                <RelationCard
                  key={relationship.id}
                  type="Senior"
                  user={senior}
                  role={roleById[String(senior.role_id)]}
                />
              );
            })
          : <Empty text="No senior user mapped" />}
      </div>

      <div className="relation-section">
        <h4>Junior users</h4>

        {juniorRelations.length
          ? juniorRelations.map((relationship) => {
              const junior = userById[String(relationship.junior_user_id)];
              if (!junior) return null;

              return (
                <RelationCard
                  key={relationship.id}
                  type="Junior"
                  user={junior}
                  role={roleById[String(junior.role_id)]}
                />
              );
            })
          : <Empty text="No junior users mapped" />}
      </div>
    </>
  );
}

function Detail({ label, value, mono }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong className={mono ? "mono" : ""}>{value}</strong>
    </div>
  );
}

function RelationCard({ type, user, role }) {
  return (
    <div className="relation-card">
      <div className="mini-avatar">{user.full_name.charAt(0)}</div>

      <div>
        <strong>{user.full_name}</strong>
        <span>{role?.role_name || "Unknown role"}</span>
      </div>

      <span className="relation-type">{type}</span>
      <span className="id-chip">ID {user.id}</span>
    </div>
  );
}

function UserPill({ user, role, onClick }) {
  return (
    <button className="user-pill" onClick={onClick}>
      <span className="mini-avatar">{user.full_name.charAt(0)}</span>

      <span>
        <b>{user.full_name}</b>
        <small>
          USER ID {user.id} · {role?.role_name || "Unknown role"}
        </small>
      </span>
    </button>
  );
}

function Empty({ text }) {
  return <div className="empty">{text}</div>;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
