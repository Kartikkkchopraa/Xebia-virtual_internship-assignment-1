
import {
Navigate,
Outlet,
} from "react-router-dom";

export default function ProtectedRoute() {

const user =
localStorage.getItem(
"user"
);

if (!user) {
return (
<Navigate
to="/login"
/>
);
}

const parsed =
JSON.parse(
user
);

if (
parsed.role
!== "ADMIN"
) {
return (
<Navigate
to="/login"
/>
);
}

return (
<Outlet/>
);

}

