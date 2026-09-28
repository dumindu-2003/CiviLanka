using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using WebApplication1.Interfaces;
using WebApplication1.Models;
using WebApplication1.Database_Layer;

namespace WebApplication1.DataAccess
{
    public class DAUser : IUser
    {
        public Response User()
        {
            Response res = new Response();
            List<UserModel> userList = new List<UserModel>();

            string Query = "SELECT " +
                                "User_id, " +
                                "type," +
                                "phone_no, " +
                                "Email, " +
                                "user_name, " +
                                "company_id, " +
                                "(select company_name from assets_company_master where id = company_id) company_name " +
                            "FROM " +
                                "assets_user_master ";

            using (var DBconnect = new DBconnect())
            {
                using (SqlDataReader reader = DBconnect.ReadTable(Query))
                {
                    while (reader.Read())
                    {

                        UserModel user = new UserModel();


                        user.UserId = reader["User_id"].ToString();
                        user.Type = reader["type"].ToString();
                        user.PhoneNo = reader["phone_no"].ToString();
                        user.Email = reader["Email"].ToString();
                        user.UserName = reader["user_name"].ToString();
                        user.CompanyName = reader["company_name"].ToString();
                        user.CompanyId = reader["company_id"].ToString();

                        userList.Add(user);
                    }
                }
            }
            res.StatusCode = 200;
            res.ResultSet = userList;
            return res;
        }
    }
}