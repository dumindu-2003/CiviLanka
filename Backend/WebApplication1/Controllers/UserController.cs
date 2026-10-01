using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplication1.DataAccess;
using WebApplication1.Interfaces;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;
using static System.Net.Mime.MediaTypeNames;

namespace WebApplication1.Controllers
{
    public class UserController : Controller
    {
        private readonly IUser _User;

        //DATest DATest = new DATest();

        public UserController(IUser user)
        {
            _User = user;
        }

        // GET: Test

        [HttpGet]
        public ActionResult Getuserbyid(UserRequestAPI requestAPI)
        {
            return Json(_User.Getuserbyserviceno(requestAPI), JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult Getuserbyserviceno(UserRequestAPI requestAPI)
        {
            return Json(_User.Getuserbyserviceno(requestAPI), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult adduser(UserRequestAPI requestAPI)
        {
            return Json(_User.adduser(requestAPI), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult deleteuserbyid(UserRequestAPI requestAPI)
        {
            return Json(_User.deleteuserbyid(requestAPI), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult deleteuserbysericeno(UserRequestAPI requestAPI)
        {
            return Json(_User.deleteuserbysericeno(requestAPI), JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public ActionResult updateuserbyid(UserRequestAPI requestAPI)
        {
            return Json(_User.updateuserbyid(requestAPI), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult updateuserbyserviceno(UserRequestAPI requestAPI)
        {
            return Json(_User.updateuserbyserviceno(requestAPI), JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult Login(UserRequestAPI requestAPI)
        {
            return Json(_User.Login(requestAPI), JsonRequestBehavior.AllowGet);
        }


        //For test Password hash to update database 
        [HttpGet]
        public ActionResult GeneratePasswordHash()
        {
            string password = "Password@123";

            string hash = BCrypt.Net.BCrypt.HashPassword(password);

            return Content(hash);
        }
    }
}
