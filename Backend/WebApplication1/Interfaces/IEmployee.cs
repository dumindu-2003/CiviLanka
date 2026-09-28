using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.Interfaces
{
    public interface IEmployee
    {
        Response EmpDetails(UserRequestAPI requestAPI);
        Response Getempbyid(UserRequestAPI requestAPI);
    }
}
