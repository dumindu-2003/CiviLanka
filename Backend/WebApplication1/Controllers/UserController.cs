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
        public ActionResult Getuserbyid()
        {
            var result = _User.Getuserbyid();
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult Getuserbyserviceno()
        {
            var result = _User.Getuserbyserviceno();
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult adduser()
        {
            var result = _User.adduser();
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult deleteuserbyid()
        {
            var result = _User.deleteuserbyid();
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult deleteuserbysericeno()
        {
            var result = _User.deleteuserbysericeno();
            return Json(result, JsonRequestBehavior.AllowGet);
        }
        [HttpPost]
        public ActionResult updateuserbyid()
        {
            var result = _User.updateuserbyid();
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public ActionResult updateuserbyserviceno()
        {
            var result = _User.updateuserbyserviceno();
            return Json(result, JsonRequestBehavior.AllowGet);
        }
      

    }
}
