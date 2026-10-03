"""Unity container equivalent: interface -> implementation. Controllers ask for the interface only."""
from typing import Dict, Type, TypeVar

from DataAccess.DAAdmin import DAAdmin
from DataAccess.DAAudit import DAAudit
from DataAccess.DAAuth import DAAuth
from DataAccess.DABank import DABank
from DataAccess.DABirth import DABirth
from DataAccess.DACitizen import DACitizen
from DataAccess.DADeath import DADeath
from DataAccess.DADistrict import DADistrict
from DataAccess.DAMarriage import DAMarriage
from DataAccess.DANews import DANews
from DataAccess.DANic import DANic
from DataAccess.DANotification import DANotification
from DataAccess.DAProfile import DAProfile
from DataAccess.DAVillage import DAVillage
from Interfaces.IAdmin import IAdmin
from Interfaces.IAudit import IAudit
from Interfaces.IAuth import IAuth
from Interfaces.IBank import IBank
from Interfaces.IBirth import IBirth
from Interfaces.ICitizen import ICitizen
from Interfaces.IDeath import IDeath
from Interfaces.IDistrict import IDistrict
from Interfaces.IMarriage import IMarriage
from Interfaces.INews import INews
from Interfaces.INic import INic
from Interfaces.INotification import INotification
from Interfaces.IProfile import IProfile
from Interfaces.IVillage import IVillage

T = TypeVar("T")


class UnityContainer:
    def __init__(self):
        self._registrations: Dict[type, type] = {}

    def RegisterType(self, interface: type, implementation: type):
        self._registrations[interface] = implementation

    def Resolve(self, interface: Type[T]) -> T:
        return self._registrations[interface]()


container = UnityContainer()


def RegisterComponents():
    # Register your interfaces and implementations
    container.RegisterType(IAuth, DAAuth)
    container.RegisterType(IAdmin, DAAdmin)
    container.RegisterType(INews, DANews)
    container.RegisterType(INotification, DANotification)
    container.RegisterType(IAudit, DAAudit)
    container.RegisterType(IProfile, DAProfile)
    container.RegisterType(ICitizen, DACitizen)
    container.RegisterType(IDistrict, DADistrict)
    container.RegisterType(IBirth, DABirth)
    container.RegisterType(IDeath, DADeath)
    container.RegisterType(IMarriage, DAMarriage)
    container.RegisterType(INic, DANic)
    container.RegisterType(IVillage, DAVillage)
    container.RegisterType(IBank, DABank)


def Resolve(interface: Type[T]) -> T:
    return container.Resolve(interface)
