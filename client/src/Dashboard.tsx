import axios from "axios";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

type User = {
  _id: string;

  name: string;

  email: string;

  role: string;

  active: boolean;

  profilePicture: string;
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);

  const [search, setSearch] = useState("");

  const [editing, setEditing] = useState<User | null>(null);

  const [editName, setEditName] = useState("");

  const [editEmail, setEditEmail] = useState("");

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const LIMIT = 5;

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/api/users?page=${page}&limit=${LIMIT}`,
      );

      setUsers(res.data.users);

      setTotalPages(res.data.totalPages);
    } catch {
      alert("Unable to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const toggle = async (id: string) => {
    await axios.patch(`http://localhost:5001/api/user/${id}`);

    fetchUsers();
  };

  const remove = async (id: string) => {
    const confirmDelete = window.confirm("Delete user?");

    if (!confirmDelete) return;

    await axios.delete(`http://localhost:5001/api/user/${id}`);

    fetchUsers();
  };

  const openEdit = (user: User) => {
    setEditing(user);

    setEditName(user.name);

    setEditEmail(user.email);
  };

  const update = async () => {
    if (!editing) return;

    await axios.put(
      `http://localhost:5001/api/user/${editing._id}`,

      {
        name: editName,

        email: editEmail,
      },
    );

    setEditing(null);

    fetchUsers();
  };

  const logout = () => {
    localStorage.removeItem("user");

    navigate("/login");
  };

  const filtered = users.filter((user) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query) ||
      (user.active ? "active" : "inactive").includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* NAVBAR */}

      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              User Dashboard
            </h1>

            <p className="text-sm text-slate-500">Manage users efficiently</p>
          </div>

          <button
            onClick={logout}
            className="
px-5
py-2
rounded-xl
bg-red-500
text-sm
text-white
hover:bg-red-600
"
          >
            Logout
          </button>
        </div>
      </header>

      {/* BODY */}

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* TOP */}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Users</h2>

            <p className="text-sm text-slate-500">
              Total users: {users.length}
            </p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="
w-65
bg-white
border
rounded-xl
px-4
py-2.5
text-sm
outline-none
focus:ring-2
focus:ring-indigo-500
"
          />
        </div>

        {/* TABLE */}

        <div className="bg-white rounded-3xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-slate-500 text-sm border-b">
                <th className="text-left p-5">User</th>

                <th className="text-left">Email</th>

                <th className="text-left">Role</th>

                <th className="text-left">Status</th>

                <th className="text-right pr-8">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user._id}
                  className="
border-b
hover:bg-slate-50
"
                >
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={`http://localhost:5001${user.profilePicture}`}
                        className="
w-10
h-10
rounded-full
object-cover
"
                      />

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {user.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="text-sm text-slate-600">{user.email}</td>

                  <td>
                    <span
                      className="
text-xs
bg-indigo-50
text-indigo-700
px-3
py-1
rounded-full
"
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`

text-xs
px-3
py-1
rounded-full

${user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}

`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="flex justify-end gap-2 pr-5">
                      <button
                        onClick={() => openEdit(user)}
                        className="
text-sm
px-3
py-2
rounded-lg
bg-amber-100
text-amber-700
"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggle(user._id)}
                        className="
text-sm
px-3
py-2
rounded-lg
bg-blue-100
text-blue-700
"
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() => remove(user._id)}
                        className="
text-sm
px-3
py-2
rounded-lg
bg-red-100
text-red-700
"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          className="
flex
justify-end
gap-4
mt-6
"
        >
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="
border
px-2
py-1
rounded-xl
text-xs
"
          >
            Previous
          </button>

          <p className="text-sm">
            Page
            {page}/{totalPages}
          </p>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="
bg-slate-900
text-white
px-2
py-1
rounded-xl
text-xs
"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL */}

      {editing && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white w-105 rounded-3xl p-8">
            <h2 className="text-xl font-semibold mb-6">Edit User</h2>

            <div className="space-y-4">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Name"
                className="
w-full
border
rounded-xl
px-4
py-3
outline-none
focus:ring-2
focus:ring-indigo-500
"
              />

              <input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email"
                className="
w-full
border
rounded-xl
px-4
py-3
outline-none
focus:ring-2
focus:ring-indigo-500
"
              />
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setEditing(null)}
                className="
px-5
py-2
rounded-xl
border
"
              >
                Cancel
              </button>

              <button
                onClick={update}
                className="
px-5
py-2
rounded-xl
bg-indigo-600
text-white
"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
