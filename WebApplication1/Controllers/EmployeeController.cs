using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplication1.Interfaces;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.Controllers
{
    public class EmployeeController : Controller
    {

        private readonly IEmployee _Employee;

        //DATest DATest = new DATest();

        public EmployeeController(IEmployee employee)
        {
            _Employee = employee;
        }

        // GET: Test

        [HttpGet]
        public ActionResult EmpDetails(UserRequestAPI requestAPI)
        {
            var result = _Employee.EmpDetails(requestAPI);
            return Json(result, JsonRequestBehavior.AllowGet);
        }
       
        [HttpGet]
        public ActionResult Getempbyid(UserRequestAPI requestAPI)
        {
            var result = _Employee.Getempbyid(requestAPI);
            return Json(result, JsonRequestBehavior.AllowGet);
        }


        // GET: Employee
        public ActionResult Index()
        {
            return View();
        }
    }
}