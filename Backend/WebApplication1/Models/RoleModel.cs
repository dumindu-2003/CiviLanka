using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models
{
    public class RoleModel
    {
        public string role_id { get; set; }
        public string role_name { get; set; }
        public string role_code { get; set; }
        public string description { get; set; }
        public string home_screen_id { get; set; }
        public string is_system { get; set; }
        public string is_active { get; set; }
        public string created_by { get; set; }
        public string created_at { get; set; }
        public string updated_at { get; set; }
        public string updated_by { get; set; }
    }

}