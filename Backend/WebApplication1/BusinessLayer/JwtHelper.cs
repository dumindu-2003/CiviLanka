// ============================================================
//  File : BusinessLogic/JwtHelper.cs
//  Desc : JWT Token Generation & Validation
//
//  NuGet packages needed:
//  PM> Install-Package System.IdentityModel.Tokens.Jwt
//  PM> Install-Package Microsoft.IdentityModel.Tokens
//
//  No Web.config entries needed — Secret/Issuer/Audience/ExpiryMinutes
//  are hardcoded constants below.
// ============================================================
using WebApplication1.Models;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace WebApplication1.BusinessLayer
{
    public static class JwtHelper
    {
        // ── Hardcoded values (Web.config has no matching appSettings keys) ──
        private const string Secret = "CIVIC_GOV_SECRET_KEY_MIN_32_CHARS_LONG!";
        private const string Issuer = "CIVICGOV";
        private const string Audience = "CIVICGOVUsers";
        private const int ExpiryMinutes = 1440;

        // ============================================================
        //  GENERATE TOKEN
        //  Called after successful Login or OAuthLogin
        // ============================================================
        public static string GenerateToken(UserModel user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.officer_id?.ToString()  ?? ""),
                new Claim("role_id",                  user.role_id?.ToString()   ?? "7"),
                new Claim("username",                user.username             ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat,
                          DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                          ClaimValueTypes.Integer64)
            };

            var token = new JwtSecurityToken(
                issuer: Issuer,
                audience: Audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(ExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ============================================================
        //  VALIDATE TOKEN
        //  Returns ClaimsPrincipal if valid, null if invalid/expired
        // ============================================================
        public static ClaimsPrincipal ValidateToken(string token)
        {
            try
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
                var handler = new JwtSecurityTokenHandler();

                var parameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,

                    ValidateIssuer = true,
                    ValidIssuer = Issuer,

                    ValidateAudience = true,
                    ValidAudience = Audience,

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero   // no grace period
                };

                return handler.ValidateToken(token, parameters, out _);
            }
            catch
            {
                return null;   // invalid or expired
            }
        }

        // ============================================================
        //  CONVENIENCE METHODS — read claims from token string
        // ============================================================

        // Get userId from token
        public static string GetUserIdFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        // Get roleId from token
        public static string GetRoleIdFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst("roleId")?.Value;
        }

        // Get roleName from token
        public static string GetRoleNameFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst("roleName")?.Value;
        }

        // Get email from token
        public static string GetEmailFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst(ClaimTypes.Email)?.Value;
        }

        // Check if token belongs to System Admin (roleId = 1)
        public static bool IsAdminToken(string token)
        {
            return GetRoleIdFromToken(token) == "1";
        }

        // Check if token belongs to DISTRICT_REGISTRAR (roleId = 2)
        public static bool IsDISTRICT_REGISTRARToken(string token)
        {
            return GetRoleIdFromToken(token) == "2";
        }

        // Check if token belongs to Citizen (roleId = 3)
        public static bool IsCitizenToken(string token)
        {
            return GetRoleIdFromToken(token) == "3";
        }

        // Check if token belongs to Citizen (roleId = 4)
        public static bool IsDEATH_REGISTRARToken(string token)
        {
            return GetRoleIdFromToken(token) == "4";
        }

        // Check if token belongs to MARRIAGE_REGISTRAR (roleId = 5)
        public static bool IsMARRIAGE_REGISTRARToken(string token)
        {
            return GetRoleIdFromToken(token) == "5";
        }

        // Check if token belongs to VILLAGE_OFFICER (roleId = 6)
        public static bool IsVILLAGE_OFFICERToken(string token)
        {
            return GetRoleIdFromToken(token) == "6";
        }

        // Check if token belongs to BANK_OFFICER (roleId = 7)
        public static bool IsBANK_OFFICERToken(string token)
        {
            return GetRoleIdFromToken(token) == "7";
        }

        // Check if token is expired
        public static bool IsTokenExpired(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                return jwtToken.ValidTo < DateTime.UtcNow;
            }
            catch
            {
                return true;
            }
        }

        // ============================================================
        //  JWT AUTHORIZE ATTRIBUTE
        //  Add [JwtAuthorize] on any Controller or Action
        //  to protect it — reads Bearer token from Authorization header
        // ============================================================
        // Usage :
        //   [JwtAuthorize]                    — any logged-in user
        //   [JwtAuthorize(RequiredRole = "1")] — Admin only
        //   [JwtAuthorize(RequiredRole = "2")] — Trainer only
        // ============================================================
    }

    // ================================================================
    //  JwtAuthorizeAttribute
    //  Place this class in the same file or in a separate Filters/ file
    // ================================================================
    public class JwtAuthorizeAttribute : System.Web.Mvc.ActionFilterAttribute
    {
        // Optional: "1" = Admin, "2" = Trainer, "3" = Member, null = any role
        public string RequiredRole { get; set; }

        public override void OnActionExecuting(
            System.Web.Mvc.ActionExecutingContext filterContext)
        {
            // ── Read Authorization header ─────────────────────────────
            var request = filterContext.HttpContext.Request;
            var authHeader = request.Headers["Authorization"];

            if (string.IsNullOrWhiteSpace(authHeader) ||
                !authHeader.StartsWith("Bearer "))
            {
                filterContext.Result = new System.Web.Mvc.JsonResult
                {
                    Data = new { StatusCode = 401, Message = "Unauthorized. Token missing." },
                    JsonRequestBehavior = System.Web.Mvc.JsonRequestBehavior.AllowGet
                };
                return;
            }

            // ── Extract token ─────────────────────────────────────────
            string token = authHeader.Substring("Bearer ".Length).Trim();

            // ── Validate token ────────────────────────────────────────
            var principal = JwtHelper.ValidateToken(token);
            if (principal == null)
            {
                filterContext.Result = new System.Web.Mvc.JsonResult
                {
                    Data = new { StatusCode = 401, Message = "Unauthorized. Invalid or expired token." },
                    JsonRequestBehavior = System.Web.Mvc.JsonRequestBehavior.AllowGet
                };
                return;
            }

            // ── Role check (optional) ─────────────────────────────────
            if (!string.IsNullOrWhiteSpace(RequiredRole))
            {
                var roleId = principal.FindFirst("roleId")?.Value;
                if (roleId != RequiredRole)
                {
                    filterContext.Result = new System.Web.Mvc.JsonResult
                    {
                        Data = new { StatusCode = 403, Message = "Forbidden. Insufficient role." },
                        JsonRequestBehavior = System.Web.Mvc.JsonRequestBehavior.AllowGet
                    };
                    return;
                }
            }

            // ── Store principal in HttpContext for downstream use ──────
            filterContext.HttpContext.Items["user"] = principal;

            base.OnActionExecuting(filterContext);
        }
    }
}