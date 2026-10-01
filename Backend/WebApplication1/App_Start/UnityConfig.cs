using System.Web.Mvc;
using Unity;
using Unity.Mvc5;
using WebApplication1.Interfaces;
using WebApplication1.DataAccess;

namespace WebApplication1
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
            var container = new UnityContainer();

            // Register your interfaces and implementations
            container.RegisterType<IUser, DAUser>();
           

            // Set the dependency resolver for MVC
            DependencyResolver.SetResolver(new UnityDependencyResolver(container));
        }
    }
}
