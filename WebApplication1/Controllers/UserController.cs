using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplication1.Interfaces;
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
        public ActionResult User()
        {
            var result = _User.User();
            return Json(result, JsonRequestBehavior.AllowGet);
        }


    }
}
