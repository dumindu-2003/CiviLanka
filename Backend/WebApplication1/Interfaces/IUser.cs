using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.Interfaces
{
    public interface IUser
    {
        Response Getuserbyid(UserRequestAPI requestAPI);
        Response Getuserbyserviceno(UserRequestAPI requestAPI);
        Response adduser(UserRequestAPI requestAPI);
        Response deleteuserbyid(UserRequestAPI requestAPI);
        Response deleteuserbysericeno(UserRequestAPI requestAPI);
        Response updateuserbyid(UserRequestAPI requestAPI);
        Response updateuserbyserviceno(UserRequestAPI requestAPI);
        Response Login(UserRequestAPI requestAPI);
    }
}
