using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApplication1.Models.RequestApiModels
{
    public class UserRequestAPI : RequestAPI
    {
        public string p_officer_id { get; set; }
        public string p_username { get; set; }
        public string p_password { get; set; }
        public string p_service_number { get; set; }
        public string p_role_id { get; set; }
        public string p_is_active { get; set; }
        public string p_must_change_password { get; set; }
        public string p_last_login_at { get; set; }
        public string p_created_by { get; set; }
        public string p_created_at { get; set; }
        public string p_updated_at { get; set; }
        public string p_updated_by { get; set; }

    }
}