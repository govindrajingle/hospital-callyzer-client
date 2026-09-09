# Hospital User Hierarchy — API Version

React + Vite + JavaScript frontend for the Hospital Callyzer API.

## Backend

The frontend expects the API server at:

`http://localhost:3000`

Vite proxies `/api/*` to that backend during development.

## API calls

On page load and when Refresh is clicked, the app requests:

```text
GET /api/hospitals
GET /api/users
GET /api/role-masters
GET /api/users-relationship
```

These correspond to the API endpoints supplied for:

- Hospitals
- Users
- Role Masters
- User Relationships

The relationship-specific endpoints are not required for the initial hierarchy because the all-relationships endpoint provides the complete relationship set.

## Run

Start the backend first on port 3000, then:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## API response normalization

The frontend maps the API camelCase fields to the existing UI model:

```text
hospitalName  -> hospital_name
hospitalCode  -> hospital_code

roleName      -> role_name
roleCode      -> role_code
parentRoleId  -> parent_role_id

hospitalId    -> hospital_id
roleId        -> role_id
userName      -> username
fullName      -> full_name

seniorId      -> senior_user_id
juniorId      -> junior_user_id
```

It also accepts either a direct array or common response wrappers such as:

```json
[ ... ]
```

or:

```json
{ "data": [ ... ] }
```

and resource-specific wrappers such as `{ "hospitals": [...] }`.

## Hierarchy logic

The user tree is relationship-driven:

```text
Hospital
  └── root users
        └── Senior User
              └── Junior User
```

A user is a root when that user does not appear as a `juniorId` in the hospital's relationships.

The role section independently uses:

```text
RoleMaster.parentRoleId
```

to display role parent information.

## Important

The backend API specification supplied does not define authentication, pagination, or exact response-envelope formats. The frontend therefore does not assume any of those and uses the GET endpoints directly.
