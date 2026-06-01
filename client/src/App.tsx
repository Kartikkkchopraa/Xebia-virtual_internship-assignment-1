
import {
BrowserRouter,
Routes,
Route,
Navigate,
} from "react-router-dom";

import Register from "./Register";

import Login from "./Login";

import Dashboard from "./Dashboard";

import ProtectedRoute from "./ProtectedRoute";

export default function App() {

return (

<BrowserRouter>

<Routes>

<Route
path="/"

element={
<Navigate
to="/register"
/>
}
/>

<Route
path="/register"

element={
<Register/>
}
/>

<Route
path="/login"

element={
<Login/>
}
/>

{/* ADMIN */}

<Route
element={
<ProtectedRoute/>
}
>

<Route

path="/dashboard"

element={
<Dashboard/>
}

/>

</Route>

</Routes>

</BrowserRouter>

);

}

