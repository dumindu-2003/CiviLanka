using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models.RequestApiModels
{
    public class RoleRequestAPI : RequestAPI
    {
        public string p_role_id { get; set; }
        public string p_role_name { get; set; }
        public string p_role_code { get; set; }
        public string p_description { get; set; }
        public string p_home_screen_id { get; set; }
        public string p_is_system { get; set; }
        public string p_is_active { get; set; }
        public string p_created_by { get; set; }
        public string p_created_at { get; set; }
        public string p_updated_at { get; set; }
        public string p_updated_by { get; set; }
    }
}