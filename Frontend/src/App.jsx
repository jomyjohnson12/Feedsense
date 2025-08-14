import { Route, Routes } from "react-router-dom";
import Loginprotectroute from "../components/Loginprotectroute";
import Protectorroute from "../components/Protectorroute";

import Admindashboard from "../pages/Feedsense/Admindashboard";
import Userdashboard from "../pages/Feedsense/Userdashboard";
import Login from "../pages/Feedsense/Login";
import Feedback from "../pages/Feedsense/Feedback";
import LayoutWithNavbar from "../pages/Feedsense/LayoutWithNavbar";
import Dashuser from "../pages/Feedsense/Dashuser";
import Resetpassword from "../pages/Feedsense/Resetpassword";
import Myfeedback from "../pages/Feedsense/Myfeedback";

import Allfeedback from "../pages/Feedsense/Allfeedback";
import AllCustomer from "../pages/Feedsense/AllCustomer";
import LogFile from "../pages/Feedsense/LogFile";







const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<Loginprotectroute />}>
        <Route path="/" element={<Login />} />
      </Route>

      {/* Protected routes with Navbar */}
      <Route element={<Protectorroute />}>
        <Route element={<LayoutWithNavbar />}>
          <Route path="/Admindashboard" element={<Admindashboard />} />
          <Route path="/Userdashboard" element={<Feedback />} />
          <Route path="/feedback" element={<Myfeedback />} />
          <Route path="/profile" element={<Dashuser />} />
          <Route path="/Resetpassword" element={<Resetpassword />} />


          <Route path="/Allfeedback" element={<Allfeedback />} />
          <Route path="/AllCustomer" element={<AllCustomer />} />
          <Route path="/LogFile" element={<LogFile />} />





        </Route>
      </Route>
    </Routes>
  );
};

export default App;
