using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using WebApplication1.Interfaces;
using WebApplication1.Models;
using WebApplication1.Database_Layer;
using WebApplication1.Models.RequestApiModels;
using System.Data;
using biZTrack.Static;

namespace WebApplication1.DataAccess
{
    public class DAEmployee : IEmployee
    {
        private readonly string ProcedureName = "GetEmployee";

        public Response EmpDetails(UserRequestAPI requestAPI)
        {
            Response result = new Response();

            requestAPI.ActionType = "1";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);
                if (res.ResultStatusCode == "1")
                {
                    List<EmployeeModel> EmployeeList = new List<EmployeeModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        EmployeeModel Employee = new EmployeeModel
                        {
                            Id = row["ID"].ToString(),
                            Name = row["Name"].ToString(),
                            Email = row["Email"].ToString(),

                    };
                        EmployeeList.Add(Employee);
                        result.StatusCode = 200;

                    }
                    result.ResultSet = EmployeeList;
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

        public Response Getempbyid(UserRequestAPI requestAPI)
        {
            Response result = new Response();

            requestAPI.ActionType = "2";

            using (var dbConnect = new DBconnect())
            {
                ProcedureDBModel res = dbConnect.ProcedureRead(requestAPI, ProcedureName);
                if (res.ResultStatusCode == "1")
                {
                    List<EmployeeModel> EmployeeList = new List<EmployeeModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        EmployeeModel Employee = new EmployeeModel
                        {
                            Id = row["ID"].ToString(),
                            Name = row["Name"].ToString(),
                            Email = row["Email"].ToString(),

                        };
                        EmployeeList.Add(Employee);
                        result.StatusCode = 200;

                    }
                    result.ResultSet = EmployeeList;
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
    }
}







//public Response EmpDetails()
//{
//    Response res = new Response();
//    List<EmployeeModel> EmpList = new List<EmployeeModel>();

//    string Query = "SELECT " +
//                        "ID, " +
//                        "Name," +
//                        "Email " +
//                    "FROM " +
//                        "employee";

//    using (var DBconnect = new DBconnect())
//    {
//        using (SqlDataReader reader = DBconnect.ReadTable(Query))
//        {
//            while (reader.Read())
//            {

//                EmployeeModel Emp = new EmployeeModel();


//                Emp.Id = reader["ID"].ToString();
//                Emp.Name = reader["Name"].ToString();
//                Emp.Email = reader["Email"].ToString();

//                EmpList.Add(Emp);
//            }
//        }
//    }
//    res.StatusCode = 200;
//    res.ResultSet = EmpList;
//    return res;
//}

//public Response Getempbyid(string id)
//{
//    Response res = new Response();
//    List<EmployeeModel> EmpList = new List<EmployeeModel>();

//    string Query = "SELECT " +
//                        "ID, " +
//                        "Name," +
//                        "Email " +
//                    "FROM " +
//                        "employee " +
//                        "Where " +
//                        "ID = '" + id + "'";

//    using (var DBconnect = new DBconnect())
//    {
//        using (SqlDataReader reader = DBconnect.ReadTable(Query))
//        {
//            while (reader.Read())
//            {

//                EmployeeModel Emp = new EmployeeModel();


//                Emp.Id = reader["ID"].ToString();
//                Emp.Name = reader["Name"].ToString();
//                Emp.Email = reader["Email"].ToString();

//                EmpList.Add(Emp);
//            }
//        }
//    }
//    res.StatusCode = 200;
//    res.ResultSet = EmpList;
//    return res;
//}