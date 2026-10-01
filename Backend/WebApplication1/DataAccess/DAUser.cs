using biZTrack.Static;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using WebApplication1.Database_Layer;
using WebApplication1.Interfaces;
using WebApplication1.Models;
using WebApplication1.Models.RequestApiModels;

namespace WebApplication1.DataAccess
{
    public class DAUser : IUser
    {
        private readonly string ProcedureName = "GetEmployee";

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
                            updated_at = row["updated_at"].ToString(),
                            updated_by = row["updated_by"].ToString(),

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
                            updated_at = row["updated_at"].ToString(),
                            updated_by = row["updated_by"].ToString(),

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
    }
}
