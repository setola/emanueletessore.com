---
title: "Kubernetes cert-manager is unable to fetch certificate that owns the secret"
date: 2022-08-21T17:07:53Z
draft: false
tags: ['Kubernetes', 'cert-manager']
categories: ['Troubleshoot', 'Kubernetes']
---


Today I was sifting through the cert-manager logs in my Kubernetes cluster looking for a possible cause of a certificate issue failure.

Here's the command to see the logs (remember to use tab)


```bash
kubectl logs -f -n cert-manager cert-manager-<tab-tab>
```

Here I've found a good amount of lines like this

```log
cert-manager/secret-mapper 
"msg"="unable to fetch certificate that owns the secret" 
"error"="Certificate.certmanager.k8s.io \"example-tls4\" not found" 
"certificate"={"Namespace":"default","Name":"example-tls4"} 
"secret"={"Namespace":"default","Name":"example-tls4"
```

A quick googling around pointed me to [issue 1944](https://github.com/cert-manager/cert-manager/issues/1944)

Obviuosly I don't have the `EnableCertificateOwnerRef` enabled, so I have some cleanup to do.

Here's a bash script to list all the orphan certificates in all namespaces (thanks [richstokes](https://github.com/richstokes/k8s-scripts/blob/master/clean-orphaned-secrets-cert-manager/clean-orphans.sh)):


```bash
#!/bin/bash
set -e

function list_orphans_in_namespace(){
        if [[ $# -lt 1 ]] ; then
                echo "A namespace is needed"
                exit 2;
        fi

        NAMESPACE=$1
        SECRETS=($(kubectl --namespace $NAMESPACE get secrets 2>&- | grep tls | awk '{print $1}'))
        CERTS=($(kubectl --namespace $NAMESPACE get certs 2>&- | grep True | awk '{print $1}'))
        ORPHANS=($(comm -23 <(for x in "${SECRETS[@]}"; do echo "$x"; done | sort) <(for x in "${CERTS[@]}"; do echo "$x"; done | sort)))
                
        if [ ${#ORPHANS[@]} -ne 0 ]; then
                echo "Orphaned secrets detected in ${NAMESPACE}"
                for i in ${ORPHANS[@]}; do
                        echo -e "\t$i"
                done
        fi
}

NAMESPACES=($1)


# If no namespace specified, set it to default
if [[ $# -lt 1 ]] ; then
    NAMESPACES=($(kubectl get ns -o json | jq .items[].metadata.name --raw-output))  # Array of all namespaces
fi

for NAMESPACE in ${NAMESPACES[@]}; do
        list_orphans_in_namespace $NAMESPACE
done


```

I prefered to delete every entry by hand, cause I had a couple of secrets on kube-prometheus-stack that are listed but they are not certificates.


## Grafana Alerts on cert-manager issue failure

It would be nice to have an alert whenever a cert-manager is not able to issue a certificate.

To do so, I came up with this query:

```grafana-query
sum(
  count_over_time(
    {namespace="cert-manager"} 
    |~ "\"error\"=\"failed to perform self check GET request.*\""
    | regexp `(.*http://(?P<domain>[^/]*)\/.*)`
    [1m]
  )
) by (domain)
```

An alert is set when `sum()` of such query is above 0

## Reference

* https://github.com/cert-manager/cert-manager/issues/1944
* https://github.com/richstokes/k8s-scripts/blob/master/clean-orphaned-secrets-cert-manager/clean-orphans.sh