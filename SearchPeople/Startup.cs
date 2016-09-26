using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(SearchPeople.Startup))]
namespace SearchPeople
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
