using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class UserModel
    {
        public string officer_id { get; set; }
        public string username { get; set; }
        public string password { get; set; }
        public string service_number { get; set; }
        public string role_id { get; set; }
        public string is_active { get; set; }
        public string must_change_password { get; set; }
        public string last_login_at { get; set; }
        public string created_by { get; set; }
        public string created_at { get; set; }
        public string officer_name { get; set; }
        public string unit_name { get; set; }
        public string role_name { get; set; }
        public string role_code { get; set; }
    }
}