using System.Collections.Generic;
using System.Linq;
using UnityEngine;


namespace MeanwhileUtils
{
    [System.Serializable]
    public abstract class BaseReconciler<TKey, TObject> : ISerializationCallbackReceiver where TObject : Object
    {
        private Dictionary<TKey, TObject> managedObjects;
        private List<TObject> serializedManagedObjects;

        public ICollection<KeyValuePair<TKey, TObject>> ManagedPairs
        {
            get { return managedObjects; }
        }

        public ICollection<TObject> ManagedObjects
        {
            get { return managedObjects.Values; }
        }

        public void Reconcile(IEnumerable<TKey> keys)
        {
            if (managedObjects == null)
            {
                managedObjects = new Dictionary<TKey, TObject>();
            }
            var lastKeys = managedObjects.Keys.ToList();
            var keysToCreate = keys.Except(lastKeys);
            var keysToRemove = lastKeys.Except(keys);
            foreach (var item in keysToCreate)
            {
                var newObj = Create(item);
                managedObjects.Add(item, newObj);
            }
            foreach (var item in keysToRemove)
            {
                Destroy(managedObjects[item]);
                managedObjects.Remove(item);
            }
        }

        public void Clear()
        {
            foreach (var pair in managedObjects)
            {
                Destroy(pair.Value);
            }
            managedObjects.Clear();
        }

        public void OnBeforeSerialize()
        {
            if (managedObjects != null)
            {
                serializedManagedObjects = managedObjects.Values.ToList();
            }
        }

        public void OnAfterDeserialize()
        {
            if (serializedManagedObjects != null)
            {
                foreach (var item in serializedManagedObjects)
                {
                    Destroy(item);
                }
            }
        }

        /// <summary>
        /// Create a new TObject and put it in the scene. Must be overriden by the base class.
        /// </summary>
        /// <param name="key"></param>
        /// <returns></returns>
        public abstract TObject Create(TKey key);


        /// <summary>
        /// Destroys a managed object. By default, calls Object.Destroy on it, but can be overridden.
        /// </summary>
        /// <param name="obj"></param>
        protected virtual void Destroy(TObject obj)
        {
            if (obj)
            {
                Object.Destroy(obj);
            }
        }
    }
}
