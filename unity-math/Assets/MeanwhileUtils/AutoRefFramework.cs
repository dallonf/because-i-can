using System.Reflection;
using UnityEngine;

namespace MeanwhileUtils
{

    [System.AttributeUsage(System.AttributeTargets.Field, Inherited = false, AllowMultiple = false)]
    sealed class AutoRefAttribute : System.Attribute { }

    public static class AutoRefFramework
    {
        public static void SetupAutoRefs<T>(this T script) where T : MonoBehaviour
        {
            var scriptType = typeof(T);
            var fields = scriptType.GetFields(BindingFlags.Instance | BindingFlags.DeclaredOnly | BindingFlags.NonPublic | BindingFlags.Public);
            foreach (var field in fields)
            {
                var attributes = field.GetCustomAttributes(typeof(AutoRefAttribute), false);
                if (attributes.Length != 0)
                {
                    // this field is an autoref
                    object existing = field.GetValue(script);
                    if (existing == null)
                    {
                        var foundComponent = script.GetComponent(field.FieldType);
                        field.SetValue(script, foundComponent);
                    }
                }
            }
        }
    }
}