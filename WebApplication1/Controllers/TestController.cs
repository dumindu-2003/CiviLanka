using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplication1.DataAccess;
using WebApplication1.Interfaces;

namespace WebApplication1.Controllers
{
    public class TestController : Controller
    {
        private readonly ITest _test;

        //DATest DATest = new DATest();

        public TestController(ITest test)
        {
            _test = test;
        }

        // GET: Test
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult TestUser()
        {
            var result = _test.TestUser();
            return Json(result, JsonRequestBehavior.AllowGet);
        }


    }
}

//Install - Package Unity - Version 5.11.1
//Install - Package Unity.Abstractions - Version 5.11.1
//Install - Package Unity.Mvc5 - Version 5.11.1
