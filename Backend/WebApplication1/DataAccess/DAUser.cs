using biZTrack.Static;
using BCrypt.Net;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using WebApplication1.Database_Layer;
using WebApplication1.Interfaces;
using WebApplication1.BusinessLayer;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.DataAccess
{
    public class DAUser : IUser
    {
        private readonly string ProcedureName = "[dbo].[sp_auth]";

        public Response Getuserbyid(UserRequestAPI requestAPI)
        {
            Response result = new Response();

            requestAPI.ActionType = "1";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);
                if (res.ResultStatusCode == "1")
                {
                    List<UserModel> UserList = new List<UserModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        UserModel User = new UserModel
                        {
                            officer_id = row["officer_id"].ToString(),
                            username = row["username"].ToString(),
                            password = row["password"].ToString(),
                            service_number = row["service_number"].ToString(),
                            role_id = row["role_id"].ToString(),
                            is_active = row["is_active"].ToString(),
                            must_change_password = row["must_change_password"].ToString(),
                            last_login_at = row["last_login_at"].ToString(),
                            created_by = row["created_by"].ToString(),
                            created_at = row["created_at"].ToString(),
                           // updated_at = row["updated_at"].ToString(),
                           // updated_by = row["updated_by"].ToString(),

                        };
                        UserList.Add(User);
                        result.StatusCode = 200;

                    }
                    result.ResultSet = UserList;
                }
                else
                {
                    LogHandler.WriteToLog(res.ExceptionMessage, System.Reflection.MethodBase.GetCurrentMethod().Name);
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }

                return result;
            }
        }

        public Response Getuserbyserviceno(UserRequestAPI requestAPI)
        {
            Response result = new Response();

            requestAPI.ActionType = "10";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);
                if (res.ResultStatusCode == "1")
                {
                    List<UserModel> UserList = new List<UserModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        UserModel User = new UserModel
                        {
                            officer_id = row["officer_id"].ToString(),
                            username = row["username"].ToString(),
                            password = row["password"].ToString(),
                            service_number = row["service_number"].ToString(),
                            role_id = row["role_id"].ToString(),
                            is_active = row["is_active"].ToString(),
                            must_change_password = row["must_change_password"].ToString(),
                            last_login_at = row["last_login_at"].ToString(),
                            created_by = row["created_by"].ToString(),
                            created_at = row["created_at"].ToString(),
                           // updated_at = row["updated_at"].ToString(),
                          //  updated_by = row["updated_by"].ToString(),

                        };
                        UserList.Add(User);
                        result.StatusCode = 200;

                    }
                    result.ResultSet = UserList;
                }
                else
                {
                    LogHandler.WriteToLog(res.ExceptionMessage, System.Reflection.MethodBase.GetCurrentMethod().Name);
                    result.StatusCode = 500;
                    result.Result = res.ExceptionMessage;
                }

                return result;
            }
        }

        public Response adduser(UserRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);
                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Success!!";
                }
                else
                {
                    LogHandler.WriteToLog(res.ExceptionMessage, System.Reflection.MethodBase.GetCurrentMethod().Name);
                    result.StatusCode = 500;
                    result.Result = string.IsNullOrEmpty(res.ExceptionMessage) ? res.Result : res.ExceptionMessage;
                }

                return result;
            }
        }

        public Response deleteuserbyid(UserRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);
                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Success!!";
                }
                else
                {
                    LogHandler.WriteToLog(res.ExceptionMessage, System.Reflection.MethodBase.GetCurrentMethod().Name);
                    result.StatusCode = 500;
                    result.Result = string.IsNullOrEmpty(res.ExceptionMessage) ? res.Result : res.ExceptionMessage;
                }

                return result;
            }
        }

        public Response deleteuserbysericeno(UserRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);
                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Success!!";
                }
                else
                {
                    LogHandler.WriteToLog(res.ExceptionMessage, System.Reflection.MethodBase.GetCurrentMethod().Name);
                    result.StatusCode = 500;
                    result.Result = string.IsNullOrEmpty(res.ExceptionMessage) ? res.Result : res.ExceptionMessage;
                }

                return result;
            }
        }

        public Response updateuserbyid(UserRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);
                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Success!!";
                }
                else
                {
                    LogHandler.WriteToLog(res.ExceptionMessage, System.Reflection.MethodBase.GetCurrentMethod().Name);
                    result.StatusCode = 500;
                    result.Result = string.IsNullOrEmpty(res.ExceptionMessage) ? res.Result : res.ExceptionMessage;
                }

                return result;
            }
        }

        public Response updateuserbyserviceno(UserRequestAPI requestAPI)
        {
            Response result = new Response();
            requestAPI.ActionType = "3";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);
                if (res.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Success!!";
                }
                else
                {
                    LogHandler.WriteToLog(res.ExceptionMessage, System.Reflection.MethodBase.GetCurrentMethod().Name);
                    result.StatusCode = 500;
                    result.Result = string.IsNullOrEmpty(res.ExceptionMessage) ? res.Result : res.ExceptionMessage;
                }

                return result;
            }
        }

        //Login 
        public Response Login(UserRequestAPI requestAPI)
        {
            if (string.IsNullOrWhiteSpace(requestAPI.p_username))
            {
                return new Response { StatusCode = 400, Result = "Username is required." };
            }
            if (string.IsNullOrWhiteSpace(requestAPI.p_service_number))
            {
                return new Response { StatusCode = 400, Result = "Service Number is required." };
            }
            if (string.IsNullOrWhiteSpace(requestAPI.p_password))
            {
                return new Response { StatusCode = 400, Result = "Password is required." };
            }

            var lookup = new UserRequestAPI { p_username = requestAPI.p_username, p_service_number = requestAPI.p_service_number };
            lookup.ActionType = "1";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(lookup, ProcedureName);

                if (res.ResultStatusCode == "-1")
                {
                    LogHandler.WriteToLog(res.ExceptionMessage, System.Reflection.MethodBase.GetCurrentMethod().Name);
                    return new Response { StatusCode = 500, Result = string.IsNullOrEmpty(res.ExceptionMessage) ? res.Result : res.ExceptionMessage };
                }
                if (res.ResultStatusCode != "1")
                {
                    // covers "not found", "pending approval", "inactive/rejected", "suspended" � SP already wrote the message
                    return new Response { StatusCode = 401, Result = res.Result };
                }

                DataRow row = res.ResultDataTable.Rows[0];
                string storedHash = row["password"].ToString();

                if (string.IsNullOrEmpty(storedHash) ||
                    !BCrypt.Net.BCrypt.Verify(requestAPI.p_password, storedHash))
                {
                    return new Response { StatusCode = 401, Result = "Invalid username or Service number or password." };
                }

                UserModel user = new UserModel
                {
                    officer_id = row["officer_id"].ToString(),
                    officer_name = row["officer_name"].ToString(),
                    username = row["username"].ToString(),
                    password = row["password"].ToString(),
                    service_number = row["service_number"].ToString(),
                    role_id = row["role_id"].ToString(),
                    role_code = row["role_code"].ToString(),
                    is_active = row["is_active"].ToString(),
                    must_change_password = row["must_change_password"].ToString(),
                    created_by = row["created_by"].ToString(),
                    created_at = row["created_at"].ToString(),
                    unit_name = row["unit_name"].ToString(),
                    role_name = row["role_name"].ToString(),

                };
                string token = JwtHelper.GenerateToken(user);

                return new Response
                {
                    StatusCode = 200,
                    Result = "Login successful.",
                    ResultSet = new { token, user }
                };
            }
        }
    }
}
