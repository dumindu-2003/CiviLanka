using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class UserModel
    {
        public string UserName { get; set; }
        public string Type { get; set; }
        public string UserId { get; set; }
        public string PhoneNo { get; set; }
        public string Email { get; set; }
        public string CompanyId { get; set; }
        public string CompanyName { get; set; }
    }
}