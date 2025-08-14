
import Navbar from '../../components/Navbar'
import Userpage from '../../components/Userpage'

import 'bootstrap/dist/js/bootstrap.bundle.min'

import '../../src/assets/demo.min.css'
import '../../src/assets/tabler-flags.min.css'
import '../../src/assets/tabler-payments.min.css'
import '../../src/assets/tabler-vendors.min.css'
import '../../src/assets/tabler.min.css'


const Userdashboard = () => {
  return (
    
    <div className="page">



        <div className="page-wrapper"> 
                                <Userpage/>

        </div>
    </div>
  )
}

export default Userdashboard